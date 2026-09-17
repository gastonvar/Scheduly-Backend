import { pinoLogger } from '../lib/pino.js';
import { Student, initModels } from '../models/index.js';
import { sequelize } from './sequelize.js';

initModels();

async function seedIfEmpty(): Promise<void> {
  await sequelize.authenticate();

  const count = await Student.count();
  if (count > 0) {
    pinoLogger.info({ count }, 'Students already present; skipping domain seed');
    return;
  }

  // Avoid loading the seed data unless the database actually needs it.
  const { seedDomainData } = await import('./seed.js');
  await seedDomainData();
}

seedIfEmpty()
  .catch((error: unknown) => {
    pinoLogger.error({ err: error }, 'Domain seed-if-empty failed');
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
