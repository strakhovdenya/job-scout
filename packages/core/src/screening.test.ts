import { describe, expect, it } from 'vitest';
import {
  enforceGroundedSkip,
  findUngroundedEvidence,
  screeningResultSchema,
  type ScreeningResult,
} from './screening.ts';

const source = `Senior Java Engineer (on-site, Munich).
Fluent German (C1) is required for daily customer meetings.
Our stack: Java 21, Spring Boot, Oracle.`;

function skipResult(evidence: string[]): ScreeningResult {
  return {
    outcome: 'skip',
    summary: 'On-site Java role.',
    reasons: [{ category: 'technology', summary: 'Java-only stack.', evidence }],
    remoteFromGermany: 'not_allowed',
    statedLanguageRequirements: [],
  };
}

describe('screeningResultSchema', () => {
  it('accepts a maybe outcome with unknown remote eligibility and no stated languages', () => {
    const parsed = screeningResultSchema.safeParse({
      outcome: 'maybe',
      summary: 'Remote is mentioned but allowed countries are not stated.',
      reasons: [],
      remoteFromGermany: 'unknown',
      statedLanguageRequirements: [],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a skip outcome without quoted evidence', () => {
    const parsed = screeningResultSchema.safeParse(skipResult([]));
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path).toEqual(['reasons']);
  });

  it('rejects outcomes outside the three conceptual outcomes', () => {
    const parsed = screeningResultSchema.safeParse({
      ...skipResult(['Java 21']),
      outcome: 'match_85',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('enforceGroundedSkip', () => {
  it('keeps a skip whose evidence is quoted verbatim from the source', () => {
    const result = skipResult(['Our stack: Java 21, Spring Boot']);
    expect(findUngroundedEvidence(result, source)).toEqual([]);
    expect(enforceGroundedSkip(result, source)).toMatchObject({
      outcome: 'skip',
      reasons: result.reasons,
      remoteFromGermany: 'unknown',
    });
  });

  it('downgrades a skip to maybe when any evidence is not found in the source', () => {
    const result = skipResult(['Java 21', 'Only candidates located in Spain']);
    expect(findUngroundedEvidence(result, source)).toEqual(['Only candidates located in Spain']);
    const cleaned = enforceGroundedSkip(result, source);
    expect(cleaned).toMatchObject({ outcome: 'maybe', reasons: [] });
    expect(cleaned.summary).not.toBe(result.summary);
  });

  it('downgrades a skip with an additional reason lacking evidence', () => {
    const grounded = skipResult(['Java 21']);
    const result = {
      ...grounded,
      reasons: [
        ...grounded.reasons,
        { category: 'other' as const, summary: 'Unsupported', evidence: [] },
      ],
    };
    expect(enforceGroundedSkip(result, source)).toMatchObject({
      outcome: 'maybe',
      reasons: grounded.reasons,
    });
  });

  it('checks language requirement evidence as well', () => {
    const result: ScreeningResult = {
      ...skipResult(['Java 21']),
      statedLanguageRequirements: [
        {
          language: 'German',
          requirement: 'required',
          statedLevel: 'C1',
          evidence: 'Native Dutch',
        },
      ],
    };
    expect(enforceGroundedSkip(result, source).outcome).toBe('maybe');
  });

  it('removes unsupported claims from non-skip results', () => {
    const result: ScreeningResult = {
      ...skipResult(['invented quote']),
      outcome: 'worth_exploring',
      statedLanguageRequirements: [
        {
          language: 'Dutch',
          requirement: 'required',
          statedLevel: 'C1',
          evidence: 'Fluent German (C1)',
        },
        {
          language: 'German',
          requirement: 'required',
          statedLevel: 'C2',
          evidence: 'Fluent German (C1)',
        },
        {
          language: 'German',
          requirement: 'required',
          statedLevel: 'C1',
          evidence: 'Fluent German (C1) is required',
        },
      ],
    };
    expect(enforceGroundedSkip(result, source)).toMatchObject({
      outcome: 'worth_exploring',
      reasons: [],
      remoteFromGermany: 'unknown',
      statedLanguageRequirements: [result.statedLanguageRequirements[2]],
    });
  });
});
