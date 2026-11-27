import { loadRuntimeConfig, type RuntimeConfig } from '@job-scout/core';
import type { Logger } from './logger.ts';

export const BOOTSTRAP_OPERATION = 'worker.bootstrap';

export interface WorkerDependencies {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly logger: Logger;
  /** Verifies database reachability; injected so the worker stays testable without Firestore. */
  readonly checkDatabase: (config: RuntimeConfig) => Promise<void>;
}

/**
 * Executes one bounded worker run and returns the process exit code.
 *
 * The current run is the bootstrap operation only: validate configuration, verify database
 * connectivity, report, exit. Ingestion and screening are planned for milestones M2/M3.
 */
export async function runWorker(deps: WorkerDependencies): Promise<number> {
  const { logger } = deps;
  logger.log('INFO', 'Worker starting.', {
    operation: BOOTSTRAP_OPERATION,
    nodeVersion: process.version,
    cloudRunExecution: deps.env.CLOUD_RUN_EXECUTION ?? null,
    cloudRunTaskIndex: deps.env.CLOUD_RUN_TASK_INDEX ?? null,
  });

  try {
    const config = loadRuntimeConfig(deps.env);
    await deps.checkDatabase(config);
    logger.log('INFO', 'Worker bootstrap completed.', {
      operation: BOOTSTRAP_OPERATION,
      environment: config.environment,
      providerMode: config.providerMode,
      firestoreMode: config.firestore.mode,
      processedVacancies: 0,
    });
    return 0;
  } catch (error: unknown) {
    logger.log('ERROR', 'Worker bootstrap failed.', {
      operation: BOOTSTRAP_OPERATION,
      error: error instanceof Error ? error.message : String(error),
    });
    return 1;
  }
}
