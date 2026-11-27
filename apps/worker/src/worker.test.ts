import { describe, expect, it } from 'vitest';
import { createJsonLogger } from './logger.ts';
import { BOOTSTRAP_OPERATION, runWorker } from './worker.ts';

const localEnv = {
  JOBSCOUT_ENV: 'local',
  GOOGLE_CLOUD_PROJECT: 'demo-job-scout',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  CLOUD_RUN_TASK_INDEX: '0',
};

function captureLogs() {
  const lines: Record<string, unknown>[] = [];
  const logger = createJsonLogger(
    (line) => lines.push(JSON.parse(line) as Record<string, unknown>),
    () => new Date('2026-01-01T00:00:00.000Z'),
    { service: 'worker' },
  );
  return { lines, logger };
}

describe('runWorker', () => {
  it('runs the bootstrap operation, logs structured output and exits with 0', async () => {
    const { lines, logger } = captureLogs();
    let checked = 0;

    const exitCode = await runWorker({
      env: localEnv,
      logger,
      checkDatabase: () => {
        checked += 1;
        return Promise.resolve();
      },
    });

    expect(exitCode).toBe(0);
    expect(checked).toBe(1);
    expect(lines.map((line) => line.message)).toEqual([
      'Worker starting.',
      'Worker bootstrap completed.',
    ]);
    expect(lines[0]).toMatchObject({
      severity: 'INFO',
      service: 'worker',
      operation: BOOTSTRAP_OPERATION,
      cloudRunTaskIndex: '0',
      time: '2026-01-01T00:00:00.000Z',
    });
    expect(lines[1]).toMatchObject({ providerMode: 'offline', processedVacancies: 0 });
  });

  it('exits with 1 and does not touch the database when configuration is invalid', async () => {
    const { lines, logger } = captureLogs();
    let checked = 0;

    const exitCode = await runWorker({
      env: { ...localEnv, JOBSCOUT_ENV: 'production' },
      logger,
      checkDatabase: () => {
        checked += 1;
        return Promise.resolve();
      },
    });

    expect(exitCode).toBe(1);
    expect(checked).toBe(0);
    expect(lines.at(-1)).toMatchObject({ severity: 'ERROR', operation: BOOTSTRAP_OPERATION });
  });

  it('exits with 1 when the database check fails', async () => {
    const { lines, logger } = captureLogs();

    const exitCode = await runWorker({
      env: localEnv,
      logger,
      checkDatabase: () => Promise.reject(new Error('connection refused')),
    });

    expect(exitCode).toBe(1);
    expect(lines.at(-1)).toMatchObject({ severity: 'ERROR', error: 'connection refused' });
  });
});
