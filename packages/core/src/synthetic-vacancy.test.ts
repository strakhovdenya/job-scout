import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { syntheticVacancyDatasetSchema } from './synthetic-vacancy.ts';

const datasetUrl = new URL('../../../fixtures/synthetic-vacancies.json', import.meta.url);

describe('synthetic vacancy dataset', () => {
  const dataset = syntheticVacancyDatasetSchema.parse(
    JSON.parse(readFileSync(datasetUrl, 'utf8')) as unknown,
  );

  it('covers the required screening scenarios', () => {
    const outcomes = new Set(dataset.map((vacancy) => vacancy.expected.outcome));
    expect(outcomes).toEqual(new Set(['worth_exploring', 'maybe', 'skip']));
    expect(dataset.some((vacancy) => vacancy.duplicateOf !== null)).toBe(true);
    expect(dataset.some((vacancy) => vacancy.applicationEmail !== null)).toBe(true);
    expect(dataset.some((vacancy) => vacancy.generalContactEmail !== null)).toBe(true);
    expect(dataset.some((vacancy) => vacancy.expected.remoteFromGermany === 'not_allowed')).toBe(
      true,
    );
    expect(new Set(dataset.map((vacancy) => vacancy.companyCountry))).toContain('UA');
  });

  it('only references application contacts that appear in the vacancy text or source', () => {
    for (const vacancy of dataset) {
      if (vacancy.applicationEmail !== null) {
        expect(vacancy.description).toContain(vacancy.applicationEmail);
      }
      if (vacancy.generalContactEmail !== null) {
        expect(vacancy.description).toContain(vacancy.generalContactEmail);
      }
    }
  });

  it('rejects unknown duplicate references', () => {
    const [first] = dataset;
    expect(first).toBeDefined();
    const broken = [{ ...first, duplicateOf: 'syn-999' }];
    expect(syntheticVacancyDatasetSchema.safeParse(broken).success).toBe(false);
  });
});
