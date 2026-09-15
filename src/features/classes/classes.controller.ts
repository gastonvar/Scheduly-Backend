import type { Request, Response } from 'express';
import {
  createClass,
  deleteClass,
  getClass,
  listClasses,
  updateClass,
  updateClassPaymentStatus,
} from './classes.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const classes = await listClasses();
  res.status(200).json({ data: classes });
}

export async function create(req: Request, res: Response): Promise<void> {
  const classItem = await createClass(req.body);
  res.status(201).json({ data: classItem });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const classItem = await getClass(req.params.classId as string);
  res.status(200).json({ data: classItem });
}

export async function update(req: Request, res: Response): Promise<void> {
  const classItem = await updateClass(req.params.classId as string, req.body);
  res.status(200).json({ data: classItem });
}

export async function updatePaymentStatus(req: Request, res: Response): Promise<void> {
  const classItem = await updateClassPaymentStatus(
    req.params.classId as string,
    req.body.paymentStatus,
  );
  res.status(200).json({ data: classItem });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteClass(req.params.classId as string);
  res.status(204).send();
}
