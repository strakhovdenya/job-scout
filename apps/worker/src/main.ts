import { checkFirestoreConnectivity, createFirestore } from '@job-scout/firestore';
import { createJsonLogger } from './logger.ts';
import { runWorker } from './worker.ts';

const logger = createJsonLogger((line) => process.stdout.write(`${line}\n`), undefined, {
  service: 'worker',
});

// Node.js running as PID 1 in a container ignores SIGTERM unless a handler is registered.
// Cloud Run sends SIGTERM before SIGKILL; exit promptly with the conventional status 143.
// Future long-running operations must persist pending work before this point.
process.once('SIGTERM', () => {
  logger.log('WARNING', 'Worker received SIGTERM; exiting.');
  process.exit(143);
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
