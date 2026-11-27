import type { Firestore } from '@google-cloud/firestore';
import { loadRuntimeConfig, type RuntimeConfig } from '@job-scout/core';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { checkFirestoreConnectivity, createFirestore } from './client.ts';
import { resetEmulatorDatabase } from './emulator.ts';
import { COLLECTIONS, loadSyntheticVacancyDataset, seedSyntheticVacancies } from './seed.ts';

/**
 * Requires a running Firestore emulator (`pnpm dev:infra`). Uses an isolated `demo-` project
 * id, so local development data is never touched, and resets it before every test.
 */
const datasetUrl = new URL('../../../fixtures/synthetic-vacancies.json', import.meta.url);

let config: RuntimeConfig;
let db: Firestore;

beforeAll(() => {
  config = loadRuntimeConfig(process.env);
  expect(config.environment).toBe('test');
  db = createFirestore(config);
});

beforeEach(async () => {
  await resetEmulatorDatabase(config);
});

afterAll(async () => {
  await resetEmulatorDatabase(config);
  await db.terminate();
});

describe('Firestore emulator integration', () => {
  it('connects to the emulator', async () => {
    await expect(checkFirestoreConnectivity(db)).resolves.toBeUndefined();
  });

  it('seeds the synthetic dataset idempotently', async () => {
    const dataset = await loadSyntheticVacancyDataset(datasetUrl);
    await seedSyntheticVacancies(db, dataset);
    await seedSyntheticVacancies(db, dataset);

    const snapshot = await db.collection(COLLECTIONS.vacancies).get();
    expect(snapshot.size).toBe(dataset.length);

    const ukrainian = await db.collection(COLLECTIONS.vacancies).doc('syn-003').get();
    expect(ukrainian.get('applicationEmail')).toBe('jobs@karpaty-labs.example');
    expect(ukrainian.get('synthetic')).toBe(true);
  });

  it('reset removes all documents of the test project', async () => {
    await seedSyntheticVacancies(db, await loadSyntheticVacancyDataset(datasetUrl));
    await resetEmulatorDatabase(config);
    const snapshot = await db.collection(COLLECTIONS.vacancies).get();
    expect(snapshot.empty).toBe(true);
  });
});
