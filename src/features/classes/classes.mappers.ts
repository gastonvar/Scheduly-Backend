import type { ClassAttendee } from '../../models/class-attendee.js';
import type { ClassSession } from '../../models/class-session.js';
import type { ClassPaymentStatus } from '../../shared/constants.js';

export type PublicClass = {
  id: string;
  date: string;
  durationHours: number;
  subjectId: string;
  attendees: string[];
  paymentStatus: ClassPaymentStatus;
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
};

export function toPublicClass(classSession: ClassSession): PublicClass {
  const attendees = (classSession.get('attendees') as ClassAttendee[] | undefined) ?? [];
  return {
    id: classSession.id,
    date: classSession.date.toISOString(),
    durationHours: classSession.durationHours,
    subjectId: classSession.subjectId,
    attendees: attendees.map((row) => row.studentId),
    paymentStatus: classSession.paymentStatus,
    basePrice: classSession.basePrice,
    surchargePercent: classSession.surchargePercent,
    finalPrice: classSession.finalPrice,
  };
}
