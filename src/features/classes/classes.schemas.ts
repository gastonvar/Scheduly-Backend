import { z } from 'zod';
import {
  CLASS_DURATION_STEP_HOURS,
  CLASS_PAYMENT_STATUSES,
  MIN_CLASS_DURATION_HOURS,
} from '../../shared/constants.js';
import { idParams } from '../../shared/schemas.js';

export const classIdParamsSchema = idParams('classId');

const isoDateSchema = z.string().refine((value) => Number.isFinite(Date.parse(value)), {
  message: 'date must be a valid ISO datetime',
});

const attendeeIdsSchema = z
  .array(z.string().uuid())
  .min(1)
  .transform((ids) => [...new Set(ids)]);

function isQuarterHourDuration(value: number): boolean {
  const minutes = value * 60;
  const roundedMinutes = Math.round(minutes);
  return (
    Number.isFinite(value) &&
    value >= MIN_CLASS_DURATION_HOURS &&
    Math.abs(minutes - roundedMinutes) < 1e-6 &&
    roundedMinutes % (CLASS_DURATION_STEP_HOURS * 60) === 0
  );
}

const durationHoursSchema = z.number().refine(isQuarterHourDuration, {
  message: 'durationHours must be a multiple of 15 minutes',
});

export const createClassBodySchema = z.object({
  date: isoDateSchema,
  durationHours: durationHoursSchema,
  subjectId: z.string().uuid(),
  attendees: attendeeIdsSchema,
  paymentStatus: z.enum(CLASS_PAYMENT_STATUSES).optional().default('unpaid'),
  surchargePercent: z.number().int().min(0).optional().default(0),
});

export const updateClassBodySchema = z
  .object({
    date: isoDateSchema.optional(),
    durationHours: durationHoursSchema.optional(),
    subjectId: z.string().uuid().optional(),
    attendees: attendeeIdsSchema.optional(),
    paymentStatus: z.enum(CLASS_PAYMENT_STATUSES).optional(),
    surchargePercent: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const updatePaymentStatusBodySchema = z.object({
  paymentStatus: z.enum(CLASS_PAYMENT_STATUSES),
});

export type CreateClassBody = z.infer<typeof createClassBodySchema>;
export type UpdateClassBody = z.infer<typeof updateClassBodySchema>;
export type UpdatePaymentStatusBody = z.infer<typeof updatePaymentStatusBodySchema>;
