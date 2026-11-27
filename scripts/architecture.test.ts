import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { checkArchitecture } from './architecture.ts';

it('allows public dependencies and rejects deep imports, cross-app edges, core SDKs and source cycles', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'jobscout-architecture-'));
  function write(relative: string, content: string) {
    const destination = path.join(root, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  }
  try {
    for (const module of [
      'apps/web',
      'apps/worker',
      'packages/core',
      'packages/agent',
      'packages/firestore',
    ]) {
      const config =
        module === 'apps/web'
          ? { module: 'ESNext', moduleResolution: 'Bundler', paths: { '@/*': ['./src/*'] } }
          : { module: 'NodeNext' };
      write(module + '/tsconfig.json', JSON.stringify({ compilerOptions: config }));
      write(module + '/src/index.ts', 'export {};');
    }
    write('apps/web/src/index.ts', "import '@job-scout/agent'; import '@/view';");
    write('apps/web/src/view.ts', "import '../../worker/src/index.ts';");
    write(
      'packages/core/src/index.ts',
      "import type {} from 'react'; export * from './screening.ts';",
    );
    write('packages/core/src/screening.ts', "export * from './index.ts';");
    write(
      'packages/agent/src/index.ts',
      "export * from '@job-scout/core/src/index.ts'; import('@job-scout/firestore');",
    );

    expect(checkArchitecture(root)).toEqual([
      'apps/web/src/view.ts: cross-module import must use a public package export: ../../worker/src/index.ts',
      'packages/agent/src/index.ts: forbidden dependency @job-scout/firestore',
      'packages/agent/src/index.ts: use a public shared package export: @job-scout/core/src/index.ts',
      'packages/core/src/index.ts: dependency cycle: packages/core/src/index.ts -> packages/core/src/screening.ts -> packages/core/src/index.ts',
      'packages/core/src/index.ts: external dependency forbidden in core: react',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
