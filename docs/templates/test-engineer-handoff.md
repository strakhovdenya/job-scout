# Test Engineer handoff

## Approved scope and Git references

- Issue number and URL, approved revision or SHA-256 of the approved body, and owner approval reference.
- Base branch and full base commit SHA, task branch and published full test commit SHA.

## Protected files

List each repository-relative test, fixture and helper path individually. Identify authorized nonfunctional scaffolding and its scope reference, when present.

## Acceptance criteria and RED evidence

| Criterion | Protected test file and exact test name | Command | Expected RED | Observed result and reason |
| --------- | --------------------------------------- | ------- | ------------ | -------------------------- |
| <ID>      | <path and test name>                    | <exact> | <failure>    | <failure or other result>  |

Record unrelated regression commands, results and counts. Mark missing contracts and infrastructure failures separately from behavioral RED. Explain any coverage gaps or RED results that could not be reproduced.

## Owner review and readiness

Record readiness or blocker, known limitations and points requiring owner review. The owner reviews the approved revision, baseline and protected list before starting a fresh implementation conversation. See [Git verification](../test-baseline.md).
