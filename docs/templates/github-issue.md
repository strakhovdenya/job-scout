# Synthetic example: issue lint rejects an invalid contract

## Context

Problem: A task with no affected paths cannot be scoped in review.

Why it matters: Contributors need to tell whether a diff addresses the approved task.

After the task: The issue linter rejects missing scope and accepts a complete synthetic issue.

Boundary: The linter checks local Markdown. Approval and GitHub automation are separate.

Public contract: `lintIssue(markdown)` reports contract errors as strings and returns an empty list for a valid body. This synthetic task has no separate product PRD or technical plan.

## Affects

- `scripts/issue-contract.ts`
- `scripts/issue-contract.test.ts`
- `docs/issue-contract.md`

## Docs to Read

- `docs/issue-contract.md`, item grammar and validation boundary.

## Key Invariants

- INV-1 Owner-run checks have no gated criterion IDs.

## Acceptance Criteria

- [ ] AC-1 [behavior] A synthetic issue with all required headings passes validation. Verify: scripts/issue-contract.test.ts "validates the canonical synthetic issue and ignores fenced or nested examples"
- [ ] AC-2 [doc] The contract describes the validation boundary. Verify: docs/issue-contract.md

## Test Requirement

Independent test scope covers valid and invalid synthetic Markdown through the public validator. Record the protected tests and their expected and observed results in the Test Engineer handoff.

- [ ] TR-1 [behavior] Validation reports absent scope and duplicate IDs. Verify: scripts/issue-contract.test.ts "rejects missing scope, duplicate IDs, manual checks and invalid evidence"

## Definition of Done

Record frozen baseline verification, the final PR and its latest head in the Implementation Engineer handoff.

- [ ] DOD-1 [ci] The format, lint, typecheck, test and build job succeeds on the PR head. Verify: ci "Format, lint, typecheck, test, build"

## Dependencies

None.

## Manual verification (owner, not gated)

No owner-run checks.
