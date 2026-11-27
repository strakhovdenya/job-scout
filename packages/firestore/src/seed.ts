import { readFile } from 'node:fs/promises';
import type { Firestore } from '@google-cloud/firestore';
import { syntheticVacancyDatasetSchema, type SyntheticVacancy } from '@job-scout/core';

/** Collection names are centralized; the full data model is designed in milestone M2. */
export const COLLECTIONS = {
  vacancies: 'vacancies',
} as const;

export async function loadSyntheticVacancyDataset(path: URL | string): Promise<SyntheticVacancy[]> {
  const raw: unknown = JSON.parse(await readFile(path, 'utf8'));
  return syntheticVacancyDatasetSchema.parse(raw);
}

/** Idempotent: documents are keyed by fixture id and fully overwritten. */
export async function seedSyntheticVacancies(
  db: Firestore,
  vacancies: readonly SyntheticVacancy[],
): Promise<number> {
  const batch = db.batch();
  for (const vacancy of vacancies) {
    batch.set(db.collection(COLLECTIONS.vacancies).doc(vacancy.id), vacancy);
  }
  await batch.commit();
  return vacancies.length;
}
