import type { Transaction } from 'sequelize';
import { AppError } from '../../errors/app-error.js';
import { sequelize } from '../../database/sequelize.js';
import {
  ClassAttendee,
  ClassSession,
  Student,
  StudentContact,
  Subject,
} from '../../models/index.js';
import {
  computeClassPrice,
  computeClassTotals,
  toMoneyInt,
} from '../classes/class-price.js';
import { recomputeAllDiscounts } from './discounts.js';
import {
  referralsByStudent,
  toPublicStudent,
  type PublicStudent,
} from './students.mappers.js';
import type { ContactInput, CreateStudentBody, UpdateStudentBody } from './students.schemas.js';

const studentInclude = [
  { model: StudentContact, as: 'contacts' },
] as const;

async function loadAllStudents(transaction?: Transaction): Promise<Student[]> {
  return Student.findAll({
    include: [...studentInclude],
    order: [
      ['name', 'ASC'],
      [{ model: StudentContact, as: 'contacts' }, 'createdAt', 'ASC'],
    ],
    transaction,
  });
}

function mapStudents(students: Student[]): PublicStudent[] {
  const referrals = referralsByStudent(students);
  return students.map((student) => toPublicStudent(student, referrals.get(student.id) ?? []));
}

async function getStudentRecord(studentId: string, transaction?: Transaction): Promise<Student> {
  const student = await Student.findByPk(studentId, {
    include: [...studentInclude],
    order: [[{ model: StudentContact, as: 'contacts' }, 'createdAt', 'ASC']],
    transaction,
  });
  if (!student) {
    throw AppError.notFound('Student not found');
  }
  return student;
}

async function assertValidReferrer(
  studentId: string | undefined,
  referredById: string | null,
  transaction?: Transaction,
): Promise<void> {
  if (!referredById) {
    return;
  }
  if (studentId && referredById === studentId) {
    throw AppError.badRequest('A student cannot refer themselves');
  }
  const referrer = await Student.findByPk(referredById, { transaction });
  if (!referrer) {
    throw AppError.badRequest('Referrer was not found');
  }
}

async function replaceContacts(
  studentId: string,
  contacts: ContactInput[],
  transaction: Transaction,
): Promise<void> {
  await StudentContact.destroy({ where: { studentId }, transaction });
  await StudentContact.bulkCreate(
    contacts.map((contact) => ({
      studentId,
      type: contact.type,
      value: contact.value,
    })),
    { transaction },
  );
}

async function refreshClassTotals(classId: string, transaction: Transaction): Promise<void> {
  const classSession = await ClassSession.findByPk(classId, { transaction });
  if (!classSession || classSession.paymentStatus === 'free') {
    return;
  }

  const [subject, attendeeRows] = await Promise.all([
    Subject.findByPk(classSession.subjectId, { transaction }),
    ClassAttendee.findAll({ where: { classId }, transaction }),
  ]);
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }

  const students = await Student.findAll({
    where: { id: attendeeRows.map((row) => row.studentId) },
    transaction,
  });
  const unit = computeClassPrice(subject, classSession.durationHours, classSession.surchargePercent);
  const totals = computeClassTotals(unit, students);
  classSession.basePrice = toMoneyInt(totals.basePrice);
  classSession.finalPrice = toMoneyInt(totals.finalPrice);
  classSession.surchargePercent = totals.surchargePercent;
  await classSession.save({ transaction });
}

export async function listStudents(): Promise<PublicStudent[]> {
  return mapStudents(await loadAllStudents());
}

export async function getStudent(studentId: string): Promise<PublicStudent> {
  const students = await loadAllStudents();
  const student = students.find((item) => item.id === studentId);
  if (!student) {
    throw AppError.notFound('Student not found');
  }
  return toPublicStudent(student, referralsByStudent(students).get(student.id) ?? []);
}

export async function createStudent(input: CreateStudentBody): Promise<PublicStudent> {
  return sequelize.transaction(async (transaction) => {
    await assertValidReferrer(undefined, input.referredBy ?? null, transaction);

    const student = await Student.create(
      {
        name: input.name,
        referredById: input.referredBy ?? null,
        discountPercent: 0,
      },
      { transaction },
    );

    await StudentContact.bulkCreate(
      input.contacts.map((contact) => ({
        studentId: student.id,
        type: contact.type,
        value: contact.value,
      })),
      { transaction },
    );

    await recomputeAllDiscounts(transaction);
    const created = await getStudentRecord(student.id, transaction);
    const students = await Student.findAll({ transaction });
    return toPublicStudent(created, referralsByStudent(students).get(created.id) ?? []);
  });
}

export async function updateStudent(studentId: string, input: UpdateStudentBody): Promise<PublicStudent> {
  return sequelize.transaction(async (transaction) => {
    const student = await getStudentRecord(studentId, transaction);

    if (input.referredBy !== undefined) {
      await assertValidReferrer(studentId, input.referredBy, transaction);
      student.referredById = input.referredBy;
    }
    if (input.name !== undefined) {
      student.name = input.name;
    }
    await student.save({ transaction });

    if (input.contacts) {
      await replaceContacts(studentId, input.contacts, transaction);
    }

    await recomputeAllDiscounts(transaction);
    const updated = await getStudentRecord(studentId, transaction);
    const students = await Student.findAll({ transaction });
    return toPublicStudent(updated, referralsByStudent(students).get(updated.id) ?? []);
  });
}

export async function deleteStudent(studentId: string): Promise<void> {
  await sequelize.transaction(async (transaction) => {
    await getStudentRecord(studentId, transaction);

    const attendance = await ClassAttendee.findAll({ where: { studentId }, transaction });
    const classIds = [...new Set(attendance.map((row) => row.classId))];

    await ClassAttendee.destroy({ where: { studentId }, transaction });

    for (const classId of classIds) {
      const remaining = await ClassAttendee.count({ where: { classId }, transaction });
      if (remaining === 0) {
        await ClassSession.destroy({ where: { id: classId }, transaction });
      } else {
        await refreshClassTotals(classId, transaction);
      }
    }

    await Student.destroy({ where: { id: studentId }, transaction });
    await recomputeAllDiscounts(transaction);
  });
}
