import { Firestore } from '@google-cloud/firestore';
import type { RuntimeConfig } from '@job-scout/core';

/**
 * Creates the Firestore server client for the validated runtime configuration.
 *
 * The SDK switches to emulator mode (unauthenticated, no TLS) when the process environment
 * contains FIRESTORE_EMULATOR_HOST. Because that switch is implicit, the client refuses to
 * start when the process environment and the validated configuration disagree.
 */
export function createFirestore(
  config: RuntimeConfig,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Firestore {
  const processEmulatorHost = env.FIRESTORE_EMULATOR_HOST;

  if (config.firestore.mode === 'cloud') {
    if (processEmulatorHost !== undefined && processEmulatorHost !== '') {
      throw new Error(
        'FIRESTORE_EMULATOR_HOST is set but the configuration targets Cloud Firestore.',
      );
    }
    return new Firestore({ projectId: config.googleCloudProject });
  }

  if (processEmulatorHost !== config.firestore.emulatorHost) {
    throw new Error(
      'The Firestore emulator host must be provided through FIRESTORE_EMULATOR_HOST and match the configuration.',
    );
  }
  return new Firestore({
    projectId: config.googleCloudProject,
    host: config.firestore.emulatorHost,
    ssl: false,
  });
}

/** Lightweight connectivity probe: one bounded RPC, no document reads. */
export async function checkFirestoreConnectivity(db: Firestore, timeoutMs = 5_000): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Firestore connectivity check timed out after ${timeoutMs} ms.`));
    }, timeoutMs);
  });
  try {
    await Promise.race([db.listCollections(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
