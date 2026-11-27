---
name: implementation-engineer
description: Implement one approved JobScout Issue in a fresh conversation against its frozen independent tests, verify integrity, publish one PR and stop for owner review.
---

# Implementation Engineer

Use with `task-lifecycle` only in Session 2 of the [two-session workflow](../../../docs/development.md).
If this conversation authored the baseline, stop and ask the owner to start a fresh conversation.

1. Independently read the approved Issue revision, PRD, technical plan, accepted ADRs and public contracts. Verify scope and dependencies before reading the Test Engineer handoff. Resolve conflicts rather than treating tests as replacement requirements.
2. Read the handoff; verify the existing task branch, base SHA, test SHA, approved revision and complete protected path list. Follow [baseline verification](../../../docs/test-baseline.md) against the committed files and working tree. Do not create a second task branch or rewrite the baseline.
3. Reproduce applicable expected RED using exact commands. Distinguish behavioral failures from missing contracts and infrastructure failures. Inspect architecture and load relevant engineering and technology skills.
4. Implement only approved behavior, run the frozen tests, add supplementary tests in separate files, and refactor for readability and maintainability. Keep the frozen baseline independently verifiable.
5. Do not modify or weaken protected tests, fixture expectations or helpers; delete, skip or selectively exclude valid tests; alter discovery to hide failures; disable CI gates; overfit special cases to fixtures; reduce requirements; or silently expand scope.
6. If a frozen test is incorrect, contradictory or technically invalid, identify the exact test and requirement, show concrete evidence and propose the smallest correction. Stop for explicit owner approval. Record the approved correction, new baseline and full protected paths before continuing. Never silently repair the contract.
7. Run the complete applicable `implementation-verification` suite and perform `code-review`. Recheck frozen tests, fixtures and helpers against the baseline, including staged and unstaged changes; inspect discovery, runner configuration and production code for bypasses.
8. Create meaningful English Conventional Commits and verify the final commit against the baseline. Push the existing task branch and create one final PR linked to the approved Issue using the [PR template](../../../.github/pull_request_template.md). Include production implementation and corresponding tests.
9. Verify GitHub Actions on the actual latest PR head, including all applicable integration, build, container and Terraform jobs. Failed, pending and unexecuted checks are not passes. Use the [Implementation Engineer handoff](../../../docs/templates/implementation-engineer-handoff.md) to report exact evidence and limitations.
10. Stop at owner review. Do not merge, bypass protections, force-push, close the Issue before merge, or start the next task.
