import { loadRuntimeConfig } from '@job-scout/core';
import { createFirestore } from '../client.ts';
import { assertLocalEmulatorTarget, probeEmulator } from '../emulator.ts';
import { loadSyntheticVacancyDataset, seedSyntheticVacancies } from '../seed.ts';

const datasetUrl = new URL('../../../../fixtures/synthetic-vacancies.json', import.meta.url);

try {
  const config = loadRuntimeConfig(process.env);
  const target = assertLocalEmulatorTarget(config);
  await probeEmulator(target);
  const db = createFirestore(config);
  const count = await seedSyntheticVacancies(db, await loadSyntheticVacancyDataset(datasetUrl));
  await db.terminate();
  console.log(
    JSON.stringify({
      severity: 'INFO',
      message: 'Seeded synthetic vacancies into the Firestore emulator.',
      projectId: target.projectId,
      count,
    }),
  );
} catch (error: unknown) {
  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: 'Seeding failed.',
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
}
