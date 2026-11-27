import 'server-only';
import { loadRuntimeConfig, type RuntimeConfig } from '@job-scout/core';

export function validateRuntimeConfigOrExit(): RuntimeConfig {
  try {
    return loadRuntimeConfig(process.env);
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        service: 'web',
        message: 'Refusing to start: invalid runtime configuration.',
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exit(1);
  }
}
