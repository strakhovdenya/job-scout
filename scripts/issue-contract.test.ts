import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { lintIssue } from './issue-contract.ts';

const example = readFileSync(new URL('../docs/templates/github-issue.md', import.meta.url), 'utf8');
it('validates the canonical synthetic issue and ignores fenced or nested examples', () => {
  expect(lintIssue(example + '\n\n````markdown\n```\n## Context\n````\n')).toEqual([]);
});
it('rejects missing scope, duplicate IDs, manual checks and invalid evidence', () => {
  const changed = example
    .replace('## Affects', '## Unspecified')
    .replace('AC-2 [doc]', 'AC-1 [doc]')
    .replace(
      'Verify: scripts/issue-contract.test.ts "validates the canonical synthetic issue and ignores fenced or nested examples"',
      'Verify: ran it',
    )
    .replace('No owner-run checks.', 'AC-3: Verify manually.');
  expect(lintIssue(changed)).toEqual(
    expect.arrayContaining([
      'Missing or empty section: Affects',
      'Duplicate item ID: AC-1',
      'Invalid evidence target: AC-1',
      'Owner-run checks cannot use gated item IDs.',
    ]),
  );
});
