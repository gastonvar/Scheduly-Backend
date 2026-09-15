import { z } from 'zod';
import { CONTACT_TYPES } from '../../shared/constants.js';
import { idParams } from '../../shared/schemas.js';

export const studentIdParamsSchema = idParams('studentId');

const contactInputSchema = z.object({
  id: z.string().optional(),
  type: z.enum(CONTACT_TYPES),
  value: z.string().trim().min(1).max(255),
});

export const createStudentBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  contacts: z.array(contactInputSchema).min(1),
  referredBy: z.string().uuid().nullable().optional(),
});

export const updateStudentBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    contacts: z.array(contactInputSchema).min(1).optional(),
    referredBy: z.string().uuid().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type CreateStudentBody = z.infer<typeof createStudentBodySchema>;
export type UpdateStudentBody = z.infer<typeof updateStudentBodySchema>;
export type ContactInput = z.infer<typeof contactInputSchema>;
