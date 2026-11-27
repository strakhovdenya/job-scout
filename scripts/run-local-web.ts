import { spawnSync } from 'node:child_process';

// Start Next in a fresh Node process. Its dev server forwards Node flags to its
// workers in NODE_OPTIONS, whose allowlist excludes the env-file flags we used.
const child = spawnSync(
  process.execPath,
  ['./node_modules/next/dist/bin/next', 'dev', ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
if (child.error) throw child.error;
process.exitCode = child.status ?? (child.signal === 'SIGINT' ? 130 : 1);
