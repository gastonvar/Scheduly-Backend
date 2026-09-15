import type { Transaction } from 'sequelize';
import { AppError } from '../../errors/app-error.js';
import { sequelize } from '../../database/sequelize.js';
import { ClassAttendee, ClassSession, Student, Subject } from '../../models/index.js';
import type { ClassPaymentStatus } from '../../shared/constants.js';
import { recomputeAllDiscounts } from '../students/discounts.js';
import {
  computeClassPrice,
  computeClassTotals,
  freeClassTotals,
  toMoneyInt,
  type ClassUnitPrice,
} from './class-price.js';
import { toPublicClass, type PublicClass } from './classes.mappers.js';
import type { CreateClassBody, UpdateClassBody } from './classes.schemas.js';
import { classesOverlap } from './overlap.js';

const attendeeInclude = [{ model: ClassAttendee, as: 'attendees' }] as const;

async function getClassRecord(classId: string, transaction?: Transaction): Promise<ClassSession> {
  const classSession = await ClassSession.findByPk(classId, {
    include: [...attendeeInclude],
    transaction,
  });
  if (!classSession) {
    throw AppError.notFound('Class not found');
  }
  return classSession;
}

async function getSubjectOrThrow(subjectId: string, transaction?: Transaction): Promise<Subject> {
  const subject = await Subject.findByPk(subjectId, { transaction });
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }
  return subject;
}

async function loadAttendeeStudents(studentIds: string[], transaction?: Transaction): Promise<Student[]> {
  const students = await Student.findAll({ where: { id: studentIds }, transaction });
  if (students.length !== studentIds.length) {
    throw AppError.badRequest('One or more attendees were not found');
  }
  const byId = new Map(students.map((student) => [student.id, student]));
  return studentIds.map((id) => byId.get(id)).filter((student): student is Student => Boolean(student));
}

async function assertNoOverlap(
  start: Date,
  durationHours: number,
  excludeClassId: string | undefined,
  transaction: Transaction,
): Promise<void> {
  const existing = await ClassSession.findAll({ transaction });
  const overlapping = existing.find((classSession) => {
    if (excludeClassId && classSession.id === excludeClassId) {
      return false;
    }
    return classesOverlap(start, durationHours, classSession.date, classSession.durationHours);
  });
  if (overlapping) {
    throw AppError.conflict('Ya hay una clase programada en ese horario.');
  }
}

function persistableTotals(totals: ClassUnitPrice): {
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
} {
  return {
    basePrice: toMoneyInt(totals.basePrice),
    surchargePercent: totals.surchargePercent,
    finalPrice: toMoneyInt(totals.finalPrice),
  };
}

async function computePersistedTotals(options: {
  paymentStatus: ClassPaymentStatus;
  subject: Subject;
  durationHours: number;
  surchargePercent: number;
  attendeeIds: string[];
  transaction: Transaction;
}): Promise<{ basePrice: number; surchargePercent: number; finalPrice: number }> {
  if (options.paymentStatus === 'free') {
    return persistableTotals(freeClassTotals());
  }

  const students = await loadAttendeeStudents(options.attendeeIds, options.transaction);
  const unit = computeClassPrice(options.subject, options.durationHours, options.surchargePercent);
  return persistableTotals(computeClassTotals(unit, students));
}

async function replaceAttendees(
  classId: string,
  attendeeIds: string[],
  transaction: Transaction,
): Promise<void> {
  await ClassAttendee.destroy({ where: { classId }, transaction });
  await ClassAttendee.bulkCreate(
    attendeeIds.map((studentId) => ({ classId, studentId })),
    { transaction },
  );
}

export async function listClasses(): Promise<PublicClass[]> {
  const classes = await ClassSession.findAll({
    include: [...attendeeInclude],
    order: [['date', 'ASC']],
  });
  return classes.map(toPublicClass);
}

export async function getClass(classId: string): Promise<PublicClass> {
  return toPublicClass(await getClassRecord(classId));
}

export async function createClass(input: CreateClassBody): Promise<PublicClass> {
  return sequelize.transaction(async (transaction) => {
    const subject = await getSubjectOrThrow(input.subjectId, transaction);
    await loadAttendeeStudents(input.attendees, transaction);
    const date = new Date(input.date);
    await assertNoOverlap(date, input.durationHours, undefined, transaction);

    const paymentStatus = input.paymentStatus;
    const surchargePercent = paymentStatus === 'free' ? 0 : input.surchargePercent;
    const totals = await computePersistedTotals({
      paymentStatus,
      subject,
      durationHours: input.durationHours,
      surchargePercent,
      attendeeIds: input.attendees,
      transaction,
    });

    const classSession = await ClassSession.create(
      {
        date,
        durationHours: input.durationHours,
        subjectId: subject.id,
        paymentStatus,
        ...totals,
      },
      { transaction },
    );
    await replaceAttendees(classSession.id, input.attendees, transaction);
    await recomputeAllDiscounts(transaction);
    return toPublicClass(await getClassRecord(classSession.id, transaction));
  });
}

export async function updateClass(classId: string, input: UpdateClassBody): Promise<PublicClass> {
  return sequelize.transaction(async (transaction) => {
    const classSession = await getClassRecord(classId, transaction);
    const currentAttendees = ((classSession.get('attendees') as ClassAttendee[] | undefined) ?? []).map(
      (row) => row.studentId,
    );

    const date = input.date ? new Date(input.date) : classSession.date;
    const durationHours = input.durationHours ?? classSession.durationHours;
    const subjectId = input.subjectId ?? classSession.subjectId;
    const attendeeIds = input.attendees ?? currentAttendees;
    const paymentStatus = input.paymentStatus ?? classSession.paymentStatus;

    const leavingFree = classSession.paymentStatus === 'free' && paymentStatus !== 'free';
    const surchargePercent =
      paymentStatus === 'free'
        ? 0
        : (input.surchargePercent ?? (leavingFree ? 0 : classSession.surchargePercent));

    if (input.date || input.durationHours) {
      await assertNoOverlap(date, durationHours, classId, transaction);
    }

    await loadAttendeeStudents(attendeeIds, transaction);
    const subject = await getSubjectOrThrow(subjectId, transaction);
    const totals = await computePersistedTotals({
      paymentStatus,
      subject,
      durationHours,
      surchargePercent,
      attendeeIds,
      transaction,
    });

    classSession.date = date;
    classSession.durationHours = durationHours;
    classSession.subjectId = subjectId;
    classSession.paymentStatus = paymentStatus;
    classSession.basePrice = totals.basePrice;
    classSession.surchargePercent = totals.surchargePercent;
    classSession.finalPrice = totals.finalPrice;
    await classSession.save({ transaction });

    if (input.attendees) {
      await replaceAttendees(classId, attendeeIds, transaction);
    }

    await recomputeAllDiscounts(transaction);
    return toPublicClass(await getClassRecord(classId, transaction));
  });
}

export async function updateClassPaymentStatus(
  classId: string,
  paymentStatus: ClassPaymentStatus,
): Promise<PublicClass> {
  return updateClass(classId, { paymentStatus });
}

export async function deleteClass(classId: string): Promise<void> {
  await sequelize.transaction(async (transaction) => {
    const classSession = await ClassSession.findByPk(classId, { transaction });
    if (!classSession) {
      throw AppError.notFound('Class not found');
    }
    await classSession.destroy({ transaction });
    await recomputeAllDiscounts(transaction);
  });
}
