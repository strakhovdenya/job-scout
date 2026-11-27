import { loadRuntimeConfig } from '@job-scout/core';
import { resetEmulatorDatabase } from '../emulator.ts';

try {
  const config = loadRuntimeConfig(process.env);
  await resetEmulatorDatabase(config);
  console.log(
    JSON.stringify({
      severity: 'INFO',
      message: 'Deleted all documents in the local Firestore emulator database.',
      projectId: config.googleCloudProject,
    }),
  );
} catch (error: unknown) {
  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: 'Reset refused or failed.',
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
}
