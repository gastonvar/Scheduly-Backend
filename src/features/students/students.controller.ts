import type { Request, Response } from 'express';
import { createStudent, deleteStudent, getStudent, listStudents, updateStudent } from './students.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const students = await listStudents();
  res.status(200).json({ data: students });
}

export async function create(req: Request, res: Response): Promise<void> {
  const student = await createStudent(req.body);
  res.status(201).json({ data: student });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const student = await getStudent(req.params.studentId as string);
  res.status(200).json({ data: student });
}

export async function update(req: Request, res: Response): Promise<void> {
  const student = await updateStudent(req.params.studentId as string, req.body);
  res.status(200).json({ data: student });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteStudent(req.params.studentId as string);
  res.status(204).send();
}
