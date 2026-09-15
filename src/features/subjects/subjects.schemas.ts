import { z } from 'zod';
import { idParams } from '../../shared/schemas.js';

export const subjectIdParamsSchema = idParams('subjectId');

export const createSubjectBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  pricePerHour: z.number().int().nonnegative(),
  color: z.string().trim().min(1).max(64).optional(),
});

export const updateSubjectBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    pricePerHour: z.number().int().nonnegative().optional(),
    color: z.string().trim().min(1).max(64).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type CreateSubjectBody = z.infer<typeof createSubjectBodySchema>;
export type UpdateSubjectBody = z.infer<typeof updateSubjectBodySchema>;
