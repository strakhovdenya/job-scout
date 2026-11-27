import { z } from 'zod';

/**
 * Preliminary screening answers one question: is this vacancy worth exploring further?
 * It is not candidate matching and never predicts hiring probability.
 */
export const SCREENING_OUTCOMES = ['worth_exploring', 'maybe', 'skip'] as const;
export const screeningOutcomeSchema = z.enum(SCREENING_OUTCOMES);
export type ScreeningOutcome = z.infer<typeof screeningOutcomeSchema>;

/**
 * Whether the vacancy explicitly permits working remotely from Germany.
 * "Remote" alone is not evidence of permission; it maps to `unknown`.
 */
export const remoteFromGermanySchema = z.enum(['allowed', 'not_allowed', 'unknown']);
export type RemoteFromGermany = z.infer<typeof remoteFromGermanySchema>;

const evidenceQuoteSchema = z.string().trim().min(1).max(500);

export const screeningReasonSchema = z.object({
  category: z.enum(['technology', 'language', 'location', 'seniority', 'employment', 'other']),
  summary: z.string().trim().min(1).max(300),
  /** Verbatim quotes from the vacancy text that support the reason. */
  evidence: z.array(evidenceQuoteSchema).max(5),
});
export type ScreeningReason = z.infer<typeof screeningReasonSchema>;

export const languageRequirementSchema = z.object({
  language: z.string().trim().min(2).max(40),
  requirement: z.enum(['required', 'preferred']),
  /** Proficiency exactly as stated by the source, if stated. */
  statedLevel: z.string().trim().min(1).max(60).nullable(),
  evidence: evidenceQuoteSchema,
});
export type LanguageRequirement = z.infer<typeof languageRequirementSchema>;

export const screeningResultSchema = z
  .object({
    outcome: screeningOutcomeSchema,
    summary: z.string().trim().min(1).max(500),
    reasons: z.array(screeningReasonSchema).max(10),
    remoteFromGermany: remoteFromGermanySchema,
    /**
     * Only requirements the source states explicitly. An empty list means "none stated",
     * which must not be read as "no language skills required".
     */
    statedLanguageRequirements: z.array(languageRequirementSchema).max(10),
  })
  .superRefine((result, ctx) => {
    if (result.outcome === 'skip' && !result.reasons.some((reason) => reason.evidence.length > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['reasons'],
        message: 'A skip outcome requires at least one reason backed by quoted evidence.',
      });
    }
  });
export type ScreeningResult = z.infer<typeof screeningResultSchema>;

function normalizeForComparison(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Returns evidence quotes that do not appear (whitespace- and case-insensitively) in the source. */
export function findUngroundedEvidence(result: ScreeningResult, sourceText: string): string[] {
  const source = normalizeForComparison(sourceText);
  const quotes = [
    ...result.reasons.flatMap((reason) => reason.evidence),
    ...result.statedLanguageRequirements.map((requirement) => requirement.evidence),
  ];
  return quotes.filter((quote) => !source.includes(normalizeForComparison(quote)));
}

/**
 * Conservative policy: a `skip` is only kept when every quoted piece of evidence is found
 * in the source text. Otherwise the vacancy is downgraded to `maybe`, because a false
 * negative (an interesting vacancy hidden from the user) is the costliest error.
 */
export function enforceGroundedSkip(result: ScreeningResult, sourceText: string): ScreeningResult {
  if (result.outcome !== 'skip') {
    return result;
  }
  if (findUngroundedEvidence(result, sourceText).length === 0) {
    return result;
  }
  return { ...result, outcome: 'maybe' };
}
