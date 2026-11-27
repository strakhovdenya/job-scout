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
     * Model-extracted requirements with source quotes. An empty list means no verified
     * extraction, which must not be read as "no language skills required".
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

/** Returns quotes that do not occur verbatim in the source. */
export function findUngroundedEvidence(result: ScreeningResult, sourceText: string): string[] {
  const quotes = [
    ...result.reasons.flatMap((reason) => reason.evidence),
    ...result.statedLanguageRequirements.map((requirement) => requirement.evidence),
  ];
  return quotes.filter((quote) => !sourceText.includes(quote));
}

/**
 * Filters unsupported claims for every outcome. A quote match proves textual presence only.
 * The model's interpretation of the quote still needs human review.
 */
export function enforceGroundedSkip(result: ScreeningResult, sourceText: string): ScreeningResult {
  const reasons = result.reasons.filter(
    ({ evidence }) => evidence.length > 0 && evidence.every((quote) => sourceText.includes(quote)),
  );
  const statedLanguageRequirements = result.statedLanguageRequirements.filter(
    ({ evidence, language, statedLevel }) =>
      sourceText.includes(evidence) &&
      mentions(evidence, language) &&
      (statedLevel === null || mentions(evidence, statedLevel)),
  );
  // Remote eligibility has no dedicated evidence field in the bootstrap schema.
  const lostSupport =
    reasons.length !== result.reasons.length ||
    statedLanguageRequirements.length !== result.statedLanguageRequirements.length ||
    result.remoteFromGermany !== 'unknown';
  const keepSkip =
    reasons.length > 0 &&
    reasons.length === result.reasons.length &&
    statedLanguageRequirements.length === result.statedLanguageRequirements.length;
  return {
    ...result,
    outcome: result.outcome === 'skip' && !keepSkip ? 'maybe' : result.outcome,
    summary:
      lostSupport || (result.outcome === 'skip' && !keepSkip)
        ? 'Some model claims lack verifiable source evidence. Review the vacancy text.'
        : result.summary,
    reasons,
    statedLanguageRequirements,
    remoteFromGermany: 'unknown',
  };
}

function mentions(quote: string, value: string): boolean {
  const literal = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${literal}(?![\\p{L}\\p{N}])`, 'iu').test(quote);
}
