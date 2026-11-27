import { z } from 'zod';
import { remoteFromGermanySchema, screeningOutcomeSchema } from './screening.ts';

/**
 * Synthetic, hand-written vacancies used for emulator seeding and future screening
 * evaluations. They are not collected job listings. All domains use the reserved
 * `.example` TLD.
 */
export const syntheticVacancySchema = z.object({
  id: z.string().regex(/^syn-\d{3}$/),
  synthetic: z.literal(true),
  title: z.string().trim().min(1),
  companyName: z.string().trim().min(1),
  /** ISO 3166-1 alpha-2 code of the employer's home country. */
  companyCountry: z.string().regex(/^[A-Z]{2}$/),
  locationText: z.string().trim().min(1).nullable(),
  description: z.string().trim().min(1),
  sourceUrl: z.url({ hostname: /\.example$/ }),
  applicationUrl: z.url({ hostname: /\.example$/ }).nullable(),
  applicationEmail: z.email().endsWith('.example').nullable(),
  /** A general inquiry address. It must not be treated as an application email. */
  generalContactEmail: z.email().endsWith('.example').nullable(),
  publishedAt: z.iso.datetime(),
  /** Id of the vacancy this entry duplicates, if any. */
  duplicateOf: z
    .string()
    .regex(/^syn-\d{3}$/)
    .nullable(),
  /** Expected labels for evaluations. Outcome assumes no configured candidate profile. */
  expected: z.object({
    outcome: screeningOutcomeSchema,
    remoteFromGermany: remoteFromGermanySchema,
    statedLanguages: z.array(
      z.object({ language: z.string().min(2), requirement: z.enum(['required', 'preferred']) }),
    ),
    notes: z.string().trim().min(1),
  }),
});
export type SyntheticVacancy = z.infer<typeof syntheticVacancySchema>;

export const syntheticVacancyDatasetSchema = z
  .array(syntheticVacancySchema)
  .min(1)
  .superRefine((vacancies, ctx) => {
    const ids = new Set<string>();
    vacancies.forEach((vacancy, index) => {
      if (ids.has(vacancy.id)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `Duplicate id ${vacancy.id}.`,
        });
      }
      ids.add(vacancy.id);
    });
    vacancies.forEach((vacancy, index) => {
      if (vacancy.duplicateOf !== null && !ids.has(vacancy.duplicateOf)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'duplicateOf'],
          message: `Unknown duplicate target ${vacancy.duplicateOf}.`,
        });
      }
    });
  });
