import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('stops a local entry point with inherited production settings before running application code', () => {
  const child = spawnSync(
    process.execPath,
    ['--import', './scripts/require-local.ts', '-e', 'console.log("APP_STARTED")'],
    {
      env: {
        JOBSCOUT_ENV: 'production',
        GOOGLE_CLOUD_PROJECT: 'jobscout-production-example',
        JOBSCOUT_AI_MAX_REQUESTS_PER_RUN: '1',
        JOBSCOUT_AI_MAX_TOKENS_PER_RUN: '1',
      },
      encoding: 'utf8',
    },
  );
  expect(child.status).toBe(1);
  expect(child.stderr).toContain('This command requires JOBSCOUT_ENV=local');
  expect(child.stdout).not.toContain('APP_STARTED');
});
