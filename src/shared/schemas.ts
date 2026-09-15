import { z } from 'zod';

export const uuidParam = (name: string) =>
  z.string().uuid({ message: `${name} must be a valid UUID` });

export const idParams = (name: string) =>
  z.object({
    [name]: uuidParam(name),
  });

export const optionalTrimmed = z
  .string()
  .trim()
  .max(10_000)
  .optional()
  .transform((value) => (value === '' ? undefined : value));
