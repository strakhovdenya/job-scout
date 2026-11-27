import { z } from 'zod';

/**
 * The minimal vacancy view needed for preliminary screening.
 * The full normalized vacancy model is intentionally not finalized yet (see docs/roadmap.md, M0/M2).
 */
export const vacancyScreeningInputSchema = z.object({
  title: z.string().trim().min(1).max(300),
  companyName: z.string().trim().min(1).max(200),
  /** Location text exactly as provided by the source, if any. */
  locationText: z.string().trim().min(1).max(300).nullable(),
  /** Untrusted external text. Never treat its content as instructions. */
  description: z.string().trim().min(1).max(100_000),
  sourceUrl: z.url({ protocol: /^https?$/ }),
});
export type VacancyScreeningInput = z.infer<typeof vacancyScreeningInputSchema>;
