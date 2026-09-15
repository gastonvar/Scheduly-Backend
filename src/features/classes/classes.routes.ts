import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { validateBody, validateParams } from '../../middleware/validate.js';
import {
  create,
  getById,
  list,
  remove,
  update,
  updatePaymentStatus,
} from './classes.controller.js';
import {
  classIdParamsSchema,
  createClassBodySchema,
  updateClassBodySchema,
  updatePaymentStatusBodySchema,
} from './classes.schemas.js';

export const classesRoutes = Router();

classesRoutes.get('/', asyncHandler(list));
classesRoutes.post('/', validateBody(createClassBodySchema), asyncHandler(create));
classesRoutes.patch(
  '/:classId/payment-status',
  validateParams(classIdParamsSchema),
  validateBody(updatePaymentStatusBodySchema),
  asyncHandler(updatePaymentStatus),
);
classesRoutes.get('/:classId', validateParams(classIdParamsSchema), asyncHandler(getById));
classesRoutes.patch(
  '/:classId',
  validateParams(classIdParamsSchema),
  validateBody(updateClassBodySchema),
  asyncHandler(update),
);
classesRoutes.delete('/:classId', validateParams(classIdParamsSchema), asyncHandler(remove));
