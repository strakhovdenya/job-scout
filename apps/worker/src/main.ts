import { checkFirestoreConnectivity, createFirestore } from '@job-scout/firestore';
import { createJsonLogger } from './logger.ts';
import { runWorker } from './worker.ts';

const logger = createJsonLogger((line) => process.stdout.write(`${line}\n`), undefined, {
  service: 'worker',
});

process.exitCode = await runWorker({
  env: process.env,
  logger,
  checkDatabase: async (config) => {
    const db = createFirestore(config);
    try {
      await checkFirestoreConnectivity(db);
    } finally {
      await db.terminate();
    }
  },
});
