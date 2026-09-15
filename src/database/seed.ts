import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../lib/crypto.js';
import { pinoLogger } from '../lib/pino.js';
import {
  ClassAttendee,
  ClassSession,
  Student,
  StudentContact,
  Subject,
  User,
  initModels,
} from '../models/index.js';
import type { ClassPaymentStatus, ContactType } from '../shared/constants.js';
import { CLASS_PAYMENT_STATUSES, CONTACT_TYPES } from '../shared/constants.js';
import { sequelize } from './sequelize.js';
import { recomputeAllDiscounts } from '../features/students/discounts.js';

initModels();

type SeedContact = { id: string; type: string; value: string };
type SeedStudent = {
  id: string;
  name: string;
  contacts: SeedContact[];
  referredBy: string | null;
};
type SeedSubject = { id: string; name: string; pricePerHour: number; color: string };
type SeedClass = {
  id: string;
  date: string;
  durationHours: number;
  subjectId: string;
  attendees: string[];
  paymentStatus?: string;
  basePrice?: number;
  surchargePercent?: number;
  finalPrice?: number;
};

type SeedFile = {
  students: SeedStudent[];
  subjects: SeedSubject[];
  classes: SeedClass[];
};

const SEED_EMAIL = 'gasvaryt@gmail.com';
const SEED_PASSWORD = 'Sg-yGefyNn-2026!';

function remapId(oldId: string, map: Map<string, string>): string {
  const existing = map.get(oldId);
  if (existing) {
    return existing;
  }
  const next = randomUUID();
  map.set(oldId, next);
  return next;
}

function isContactType(value: string): value is ContactType {
  return (CONTACT_TYPES as readonly string[]).includes(value);
}

function isPaymentStatus(value: string): value is ClassPaymentStatus {
  return (CLASS_PAYMENT_STATUSES as readonly string[]).includes(value);
}

function loadSeedFile(): SeedFile {
  const path = fileURLToPath(new URL('./seed-data.json', import.meta.url));
  return JSON.parse(readFileSync(path, 'utf8')) as SeedFile;
}

async function seedDomainData(): Promise<void> {
  const seed = loadSeedFile();
  const idMap = new Map<string, string>();

  await Student.bulkCreate(
    seed.students.map((student) => ({
      id: remapId(student.id, idMap),
      name: student.name,
      referredById: null,
      discountPercent: 0,
    })),
  );

  for (const student of seed.students) {
    if (!student.referredBy) {
      continue;
    }
    await Student.update(
      { referredById: remapId(student.referredBy, idMap) },
      { where: { id: remapId(student.id, idMap) } },
    );
  }

  await StudentContact.bulkCreate(
    seed.students.flatMap((student) =>
      student.contacts.filter((contact) => isContactType(contact.type)).map((contact) => ({
        id: remapId(`${student.id}:${contact.id}`, idMap),
        studentId: remapId(student.id, idMap),
        type: contact.type as ContactType,
        value: contact.value,
      })),
    ),
  );

  await Subject.bulkCreate(
    seed.subjects.map((subject) => ({
      id: remapId(subject.id, idMap),
      name: subject.name,
      pricePerHour: subject.pricePerHour,
      color: subject.color,
    })),
  );

  await ClassSession.bulkCreate(
    seed.classes.map((classItem) => ({
      id: remapId(classItem.id, idMap),
      date: new Date(classItem.date),
      durationHours: classItem.durationHours,
      subjectId: remapId(classItem.subjectId, idMap),
      paymentStatus: classItem.paymentStatus && isPaymentStatus(classItem.paymentStatus)
        ? classItem.paymentStatus
        : 'unpaid',
      basePrice: classItem.basePrice ?? 0,
      surchargePercent: classItem.surchargePercent ?? 0,
      finalPrice: classItem.finalPrice ?? 0,
    })),
  );

  await ClassAttendee.bulkCreate(
    seed.classes.flatMap((classItem) =>
      classItem.attendees.map((studentId) => ({
        classId: remapId(classItem.id, idMap),
        studentId: remapId(studentId, idMap),
      })),
    ),
  );

  await sequelize.transaction(async (transaction) => {
    await recomputeAllDiscounts(transaction);
  });

  pinoLogger.info(
    {
      students: seed.students.length,
      subjects: seed.subjects.length,
      classes: seed.classes.length,
    },
    'Domain seed data imported',
  );
}

async function seed(): Promise<void> {
  await sequelize.authenticate();

  const existingUser = await User.findOne({ where: { email: SEED_EMAIL } });
  if (!existingUser) {
    await User.create({
      email: SEED_EMAIL,
      passwordHash: await hashPassword(SEED_PASSWORD),
      active: true,
    });
    pinoLogger.info({ email: SEED_EMAIL }, 'Seed user created');
  } else {
    pinoLogger.info({ email: SEED_EMAIL }, 'Seed user already present; skipping user create');
  }

  const studentCount = await Student.count();
  if (studentCount > 0) {
    pinoLogger.info('Students already present; skipping domain seed');
    return;
  }

  await seedDomainData();
}

seed()
  .catch((error: unknown) => {
    pinoLogger.error({ err: error }, 'Seed failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
