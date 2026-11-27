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
  it('keeps a skip whose evidence is quoted from the source, ignoring case and whitespace', () => {
    const result = skipResult(['our stack:   java 21, spring boot']);
    expect(findUngroundedEvidence(result, source)).toEqual([]);
    expect(enforceGroundedSkip(result, source).outcome).toBe('skip');
  });

  it('downgrades a skip to maybe when any evidence is not found in the source', () => {
    const result = skipResult(['Java 21', 'Only candidates located in Spain']);
    expect(findUngroundedEvidence(result, source)).toEqual(['Only candidates located in Spain']);
    expect(enforceGroundedSkip(result, source).outcome).toBe('maybe');
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

  it('never changes non-skip outcomes', () => {
    const result: ScreeningResult = {
      ...skipResult(['invented quote']),
      outcome: 'worth_exploring',
    };
    expect(enforceGroundedSkip(result, source)).toBe(result);
  });
});
