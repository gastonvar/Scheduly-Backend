import { z } from 'zod';
import { CLASS_PAYMENT_STATUSES } from '../../shared/constants.js';
import { idParams } from '../../shared/schemas.js';

export const classIdParamsSchema = idParams('classId');

const isoDateSchema = z.string().refine((value) => Number.isFinite(Date.parse(value)), {
  message: 'date must be a valid ISO datetime',
});

const attendeeIdsSchema = z
  .array(z.string().uuid())
  .min(1)
  .transform((ids) => [...new Set(ids)]);

export const createClassBodySchema = z.object({
  date: isoDateSchema,
  durationHours: z.number().int().min(1),
  subjectId: z.string().uuid(),
  attendees: attendeeIdsSchema,
  paymentStatus: z.enum(CLASS_PAYMENT_STATUSES).optional().default('unpaid'),
  surchargePercent: z.number().int().min(0).optional().default(0),
});

export const updateClassBodySchema = z
  .object({
    date: isoDateSchema.optional(),
    durationHours: z.number().int().min(1).optional(),
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
