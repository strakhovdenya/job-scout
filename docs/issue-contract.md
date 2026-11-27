# JobScout issue contract

Use the [canonical synthetic example](templates/github-issue.md) as the issue body. GitHub's three entry templates point to this single format. The [validator](../scripts/issue-contract.ts) owns syntax and required sections.

The Context explains the current problem, its significance, the intended behavior, and exclusions. Affects lists the authorized files or narrow directory surfaces, including tests and docs. Docs to Read identifies the relevant rules and ADRs or states why none apply. Dependencies names real prerequisites and their status or says `None.` An unresolved prerequisite blocks implementation.

In Context or Docs to Read, cite the approved PRD and technical plan revisions, accepted ADRs and public contract locations or planned signatures. Describe independent test scope in Test Requirement, including observable scenarios and expected evidence. Specify permitted test and implementation paths under Affects and explicitly authorize any necessary nonfunctional scaffolding. Use one Issue for both sessions.

Use level-two headings and top-level bullets. Preserve stable IDs. Use `- INV-1 <rule>` for invariants and `- [ ] AC-1 [behavior] <observable outcome>. Verify: <target>` for criteria. Test Requirement uses `TR` and Definition of Done uses `DOD`. Prefer named tests covering observable behavior, including failure paths. Avoid vague, conditional, local-only or process-only gated criteria. Only list ordering as a requirement when the behavior requires it.

| Type         | Evidence target                                    |
| ------------ | -------------------------------------------------- |
| behavior     | repository-relative test file and quoted test name |
| doc / config | repository-relative file                           |
| ci           | `ci "<check name>"` on the PR head                 |
| absence      | `absent "<literal>" in <repository-relative file>` |

Owner-run checks belong in the optional `Manual verification (owner, not gated)` section with setup, procedure and expected result. They do not use gated IDs. Checkable criteria can be drafted against planned test paths. Review the actual test names, targets and evidence on the final branch.

Use Definition of Done for named final PR checks. State the expected baseline and final evidence in prose under the existing sections. After approval, record the frozen baseline and the final PR/CI results using the [test](templates/test-engineer-handoff.md) and [implementation](templates/implementation-engineer-handoff.md) handoffs. Keep these records separately from the approved requirements body. The validator grammar is unchanged.

Run `pnpm lint:issue <issue.md>` before posting a draft. It checks headings, top-level item types, ID uniqueness, syntax, wording and evidence target shapes, including ignoring fenced examples. It cannot validate semantics, approval, actual changed paths, existence of proposed evidence, live GitHub state, or current CI results. Record owner approval against an identifiable Issue revision and re-confirm after any scope change. Review actual test results and the PR head separately.
