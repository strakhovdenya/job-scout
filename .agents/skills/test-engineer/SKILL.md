---
name: test-engineer
description: Author independent deterministic tests for one approved JobScout Issue, commit and push a frozen test baseline, then stop before implementation.
---

# Test Engineer

Use with `task-lifecycle` for Session 1 of the [two-session workflow](../../../docs/development.md).
Requirements govern behavior; tests are executable evidence, not replacement requirements.

1. Read the approved Issue revision independently, then its PRD, technical plan, accepted ADRs and public contracts. Verify dependencies, authorized paths and intended base against repository evidence. Resolve contradictions before proceeding.
2. Inspect branch, working tree and remote state. Preserve owner work. Create the dedicated task branch from the verified base; record its SHA. Inspect existing implementation and test infrastructure.
3. Map each acceptance criterion to independently designed observable scenarios. Cover positive, negative, boundary and failure cases, including a bug's reproducing regression where practical. Use approved public contracts and actual variation points; do not design around an imagined implementation.
4. Write deterministic tests and synthetic fixtures using relevant engineering skills. Inject clocks, I/O and HTTP doubles; do not mock away the behavior under test. Do not implement functionality, fix the target bug, alter production behavior, reduce criteria, disable valid tests or change CI to accommodate RED.
5. Run new tests against existing implementation. Record expected and observed RED with exact commands and failure reasons. Distinguish missing-contract/import/type failures from meaningful behavioral RED. Minimal nonfunctional contract scaffolding requires explicit inclusion in approved scope and must introduce no production behavior. Stop if an unresolved design decision prevents meaningful independent tests.
6. Run unrelated existing regression tests and record results separately. Review test quality, coverage of criteria and limitations; do not use coverage statistics as a substitute for requirements.
7. Create an English test-only Conventional Commit, such as `test: define vacancy deduplication behavior`, and push the task branch. Intentionally failing new tests may remain on this branch; never merge that incomplete state into main or create an unnecessary failing PR to demonstrate RED. Do not rewrite the baseline before implementation verification.
8. Produce the [Test Engineer handoff](../../../docs/templates/test-engineer-handoff.md), recording the committed protected files and evidence. The test commit is the frozen baseline; a later handoff-only commit can record its SHA without circular self-reference. Verify the published SHA.
9. Stop for owner handoff review. Do not create the final PR or start implementation. The owner starts a fresh conversation; sequential roles in this conversation do not establish independence.
