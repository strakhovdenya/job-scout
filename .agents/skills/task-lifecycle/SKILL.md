---
name: task-lifecycle
description: Implement one approved JobScout Issue on a dedicated branch and trace its evidence through review and PR.
---

# Task Lifecycle

1. Confirm the active Issue revision, acceptance criteria, Affects paths, dependencies and applicable skills. Significant product work starts after the PRD and plan approvals. An explicitly authorized small fix may use its request as the scope record and a proportionate checklist. Establish a branch before changes and preserve work already in the checkout.
2. Work on one approved task. Verify prerequisites on the intended base. If new paths or criteria are necessary, present the smallest scope adjustment and secure approval before implementing it. Track unrelated findings separately. Keep architecture, ADRs and docs in sync.
3. Review the diff against the approved contract, then apply `code-review` and `implementation-verification`. Record actual criteria status and test evidence. Keep owner checks visible and preserve the approved body; do not silently rewrite criteria after implementation.
4. Commit in English with a Conventional Commit, push to the authorized remote branch, then create the authorized PR using the [template](../../../.github/pull_request_template.md). Link the Issue with `Closes #N` when appropriate and verify the PR head and CI. Leave issue closure to merge. Report unblocked work and stop before starting it.

The [development workflow](../../../docs/development.md) defines approval and enforcement boundaries.
