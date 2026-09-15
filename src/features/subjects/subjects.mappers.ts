import type { Subject } from '../../models/subject.js';

export type PublicSubject = {
  id: string;
  name: string;
  pricePerHour: number;
  color: string;
};

export function toPublicSubject(subject: Subject): PublicSubject {
  return {
    id: subject.id,
    name: subject.name,
    pricePerHour: subject.pricePerHour,
    color: subject.color,
  };
}
