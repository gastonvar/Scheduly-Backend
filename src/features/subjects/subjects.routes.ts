import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import { create, getById, list, remove, update } from './subjects.controller.js';
import {
  createSubjectBodySchema,
  subjectIdParamsSchema,
  updateSubjectBodySchema,
} from './subjects.schemas.js';

export const subjectsRoutes = Router();

subjectsRoutes.get('/', asyncHandler(list));
subjectsRoutes.post('/', validateBody(createSubjectBodySchema), asyncHandler(create));
subjectsRoutes.get('/:subjectId', validateParams(subjectIdParamsSchema), asyncHandler(getById));
subjectsRoutes.patch(
  '/:subjectId',
  validateParams(subjectIdParamsSchema),
  validateBody(updateSubjectBodySchema),
  asyncHandler(update),
);
subjectsRoutes.delete('/:subjectId', validateParams(subjectIdParamsSchema), asyncHandler(remove));
