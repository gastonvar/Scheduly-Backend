import type { Transaction } from 'sequelize';
import { DISCOUNT_PER_REFERRAL, MAX_DISCOUNT } from '../../shared/constants.js';
import { ClassAttendee, ClassSession, Student } from '../../models/index.js';

export function applyDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}

export function computeStudentDiscount(
  referredStudentIds: string[],
  paidAttendeeIds: ReadonlySet<string>,
): number {
  const qualifying = referredStudentIds.filter((studentId) => paidAttendeeIds.has(studentId));
  return Math.min(qualifying.length * DISCOUNT_PER_REFERRAL, MAX_DISCOUNT);
}

export async function recomputeAllDiscounts(transaction: Transaction): Promise<void> {
  const [students, paidAttendances] = await Promise.all([
    Student.findAll({ transaction }),
    ClassAttendee.findAll({
      include: [
        {
          model: ClassSession,
          as: 'classSession',
          required: true,
          where: { paymentStatus: 'paid' },
        },
      ],
      transaction,
    }),
  ]);

  const paidAttendeeIds = new Set(paidAttendances.map((row) => row.studentId));
  const referralsByReferrer = new Map<string, string[]>();

  for (const student of students) {
    if (!student.referredById) {
      continue;
    }
    const referrals = referralsByReferrer.get(student.referredById) ?? [];
    referrals.push(student.id);
    referralsByReferrer.set(student.referredById, referrals);
  }

  await Promise.all(
    students.map(async (student) => {
      const discountPercent = computeStudentDiscount(
        referralsByReferrer.get(student.id) ?? [],
        paidAttendeeIds,
      );
      if (student.discountPercent === discountPercent) {
        return;
      }
      student.discountPercent = discountPercent;
      await student.save({ transaction });
    }),
  );
}
