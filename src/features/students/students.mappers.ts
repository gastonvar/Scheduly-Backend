import type { Student } from '../../models/student.js';
import type { StudentContact } from '../../models/student-contact.js';
import type { ContactType } from '../../shared/constants.js';

export type PublicContact = {
  id: string;
  type: ContactType;
  value: string;
};

export type PublicStudent = {
  id: string;
  name: string;
  contacts: PublicContact[];
  referredBy: string | null;
  referrals: string[];
  discountPercent: number;
};

function toPublicContact(contact: StudentContact): PublicContact {
  return {
    id: contact.id,
    type: contact.type,
    value: contact.value,
  };
}

export function toPublicStudent(student: Student, referrals: string[]): PublicStudent {
  const contacts = (student.get('contacts') as StudentContact[] | undefined) ?? [];
  return {
    id: student.id,
    name: student.name,
    contacts: contacts.map(toPublicContact),
    referredBy: student.referredById,
    referrals,
    discountPercent: student.discountPercent,
  };
}

export function referralsByStudent(students: Student[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const student of students) {
    if (!student.referredById) {
      continue;
    }
    const referrals = map.get(student.referredById) ?? [];
    referrals.push(student.id);
    map.set(student.referredById, referrals);
  }
  return map;
}
