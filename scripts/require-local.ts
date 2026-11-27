import { loadRuntimeConfig } from '../packages/core/src/runtime-config.ts';

const config = loadRuntimeConfig(process.env);
if (config.environment !== 'local') {
  throw new Error(
    'This command requires JOBSCOUT_ENV=local. Use the dedicated test or production entry point.',
  );
}

// Disable Google SDK metadata probing in explicitly local commands.
process.env.METADATA_SERVER_DETECTION = 'none';
