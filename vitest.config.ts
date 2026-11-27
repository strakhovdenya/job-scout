import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const workspacePackages = ['core', 'agent', 'firestore'] as const;

export default defineConfig({
  resolve: {
    // Tests run against workspace sources; no package build is required.
    alias: [
      ...workspacePackages.map((name) => ({
        find: `@job-scout/${name}`,
        replacement: fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url)),
      })),
      { find: /^@\//, replacement: fileURLToPath(new URL('./apps/web/src/', import.meta.url)) },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['{apps,packages}/*/src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
          exclude: ['**/node_modules/**', '**/*.integration.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['{apps,packages}/*/src/**/*.integration.test.ts'],
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 30_000,
          // Isolated demo project: integration tests never touch local development data.
          env: {
            JOBSCOUT_ENV: 'test',
            JOBSCOUT_PROVIDER_MODE: 'offline',
            METADATA_SERVER_DETECTION: 'none',
            GOOGLE_CLOUD_PROJECT: 'demo-job-scout-test',
            FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080',
          },
        },
      },
    ],
  },
});
