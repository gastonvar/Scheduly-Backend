import { AppError } from '../../errors/app-error.js';
import { sequelize } from '../../database/sequelize.js';
import { ClassSession, Subject } from '../../models/index.js';
import { pickSubjectColor } from '../../shared/constants.js';
import { snapToValidPrice } from '../classes/class-price.js';
import { recomputeAllDiscounts } from '../students/discounts.js';
import { toPublicSubject, type PublicSubject } from './subjects.mappers.js';
import type { CreateSubjectBody, UpdateSubjectBody } from './subjects.schemas.js';

async function getSubjectRecord(subjectId: string): Promise<Subject> {
  const subject = await Subject.findByPk(subjectId);
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }
  return subject;
}

export async function listSubjects(): Promise<PublicSubject[]> {
  const subjects = await Subject.findAll({ order: [['name', 'ASC']] });
  return subjects.map(toPublicSubject);
}

export async function getSubject(subjectId: string): Promise<PublicSubject> {
  return toPublicSubject(await getSubjectRecord(subjectId));
}

export async function createSubject(input: CreateSubjectBody): Promise<PublicSubject> {
  const existing = await Subject.findAll({ attributes: ['color'] });
  const color = input.color ?? pickSubjectColor(existing.map((subject) => subject.color));
  const subject = await Subject.create({
    name: input.name,
    pricePerHour: snapToValidPrice(input.pricePerHour),
    color,
  });
  return toPublicSubject(subject);
}

export async function updateSubject(subjectId: string, input: UpdateSubjectBody): Promise<PublicSubject> {
  const subject = await getSubjectRecord(subjectId);
  if (input.name !== undefined) {
    subject.name = input.name;
  }
  if (input.pricePerHour !== undefined) {
    subject.pricePerHour = snapToValidPrice(input.pricePerHour);
  }
  if (input.color !== undefined) {
    subject.color = input.color;
  }
  await subject.save();
  return toPublicSubject(subject);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await sequelize.transaction(async (transaction) => {
    const subject = await Subject.findByPk(subjectId, { transaction });
    if (!subject) {
      throw AppError.notFound('Subject not found');
    }
    await ClassSession.destroy({ where: { subjectId }, transaction });
    await subject.destroy({ transaction });
    await recomputeAllDiscounts(transaction);
  });
}
