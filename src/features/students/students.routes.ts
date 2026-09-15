import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import { create, getById, list, remove, update } from './students.controller.js';
import {
  createStudentBodySchema,
  studentIdParamsSchema,
  updateStudentBodySchema,
} from './students.schemas.js';

export const studentsRoutes = Router();

studentsRoutes.get('/', asyncHandler(list));
studentsRoutes.post('/', validateBody(createStudentBodySchema), asyncHandler(create));
studentsRoutes.get('/:studentId', validateParams(studentIdParamsSchema), asyncHandler(getById));
studentsRoutes.patch(
  '/:studentId',
  validateParams(studentIdParamsSchema),
  validateBody(updateStudentBodySchema),
  asyncHandler(update),
);
studentsRoutes.delete('/:studentId', validateParams(studentIdParamsSchema), asyncHandler(remove));
