---
name: task-lifecycle
description: Route one approved JobScout Issue through independent test and implementation sessions on one branch and one final PR.
---

# Task Lifecycle

1. Confirm the active Issue revision, acceptance criteria, Affects paths, dependencies and applicable skills. Significant product work starts after the PRD and plan approvals. A documented nonbehavioral exception may use a directly authorized request as its scope record. Establish a branch before changes and preserve work already in the checkout.
2. Work on one approved task. Functional or behavior-changing tasks require two separate Codex conversations: Session 1 uses `test-engineer` to create the branch, author tests, commit/push a frozen baseline and stop; the owner reviews the handoff and starts Session 2 with `implementation-engineer` on that same branch. Do not perform both roles sequentially here. Separate conversations do not guarantee independent reasoning. Each role independently reads the approved requirements and evidence. See [development](../../../docs/development.md) for proportionate exceptions and record the reason when one applies.
3. Verify prerequisites on the intended base. If new paths or criteria are necessary, present the smallest scope adjustment and secure approval before implementing it. Track unrelated findings separately. Keep architecture, ADRs and docs in sync. Approved implementation scope authorizes normal branch, commit, push and PR work unless the owner says otherwise; research, PRD and planning approval do not authorize implementation.
4. Review the diff against the approved contract, then apply `code-review` and `implementation-verification`. Record actual criteria status, frozen baseline integrity and test evidence. Keep owner checks visible and preserve the approved body; do not silently rewrite criteria after implementation.
5. In Session 2 or a documented exception, commit in English with a Conventional Commit, push to the authorized remote branch, then create the authorized PR using the [template](../../../.github/pull_request_template.md). Link the Issue with `Closes #N` when appropriate and verify the PR head and CI. Never force-push, bypass branch protection or automatically merge. Leave issue closure to merge. Report unblocked work and stop before starting it.

The [development workflow](../../../docs/development.md) defines approval and enforcement boundaries.
