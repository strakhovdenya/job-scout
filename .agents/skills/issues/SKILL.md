---
name: issues
description: Decompose an approved JobScout plan into independently scoped GitHub Issue drafts with verifiable criteria.
---

# Issues

Read the approved plan, related ADRs, implementation and tests. Search existing issues and identify duplicates, dependencies and already shipped work. Draft batches in dependency order. Prefer complete vertical slices and state why any cross-module integration branch is warranted. Ground each task in real paths, existing contracts and architecture impact. Resolve material variation or product forks with the owner.

Use the [issue contract](../../../docs/issue-contract.md) and [canonical example](../../../docs/templates/github-issue.md). Map PRD criteria to typed acceptance items and named tests. Keep owner-only checks outside the gated items. Run `pnpm lint:issue <draft.md>`; separately review completeness, scope, dependency status, references and test feasibility before posting. Publish to the verified repo when authorized. Record the approved body revision and have the owner reconfirm any later change to approved scope. Do not create backlog work as a side effect of a review.
