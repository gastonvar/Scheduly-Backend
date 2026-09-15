import type { Request, Response } from 'express';
import {
  createSubject,
  deleteSubject,
  getSubject,
  listSubjects,
  updateSubject,
} from './subjects.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const subjects = await listSubjects();
  res.status(200).json({ data: subjects });
}

export async function create(req: Request, res: Response): Promise<void> {
  const subject = await createSubject(req.body);
  res.status(201).json({ data: subject });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const subject = await getSubject(req.params.subjectId as string);
  res.status(200).json({ data: subject });
}

export async function update(req: Request, res: Response): Promise<void> {
  const subject = await updateSubject(req.params.subjectId as string, req.body);
  res.status(200).json({ data: subject });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteSubject(req.params.subjectId as string);
  res.status(204).send();
}
