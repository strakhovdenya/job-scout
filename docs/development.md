# Development and Codex workflow

See [AGENTS.md](../AGENTS.md) for binding project rules and skill selection. Read only the workflows that apply. Use [engineering standards](engineering-standards.md) and [architecture](architecture.md) to review a change before and after implementation. Use [the inventory](skills-inventory.md) to check version, origin and limitations of installed skills.

Significant functionality follows Epic Discovery → PRD → owner approval → Technical Plan → owner approval → GitHub Issues → Task Lifecycle → Test Engineer session → owner handoff review → fresh Implementation Engineer session → code review → implementation verification → PR. Use the [discovery](templates/epic-discovery.md), [PRD](templates/prd.md), [plan](templates/technical-plan.md), [issue](templates/github-issue.md), [ADR](templates/adr.md), [verification](templates/implementation-verification.md) and [PR](../.github/pull_request_template.md) forms. Approval names the revision and covers only its agreed scope. An explicitly authorized nonbehavioral change may use the request as its scope record. Do not require a product PRD for foundation work already explicitly authorized.

Before coding, verify dependencies and scope in the [issue contract](issue-contract.md). Work on one approved Issue, two independent sessions, one dedicated branch and one final PR. Approval of an implementation task authorizes normal task branching, commits, push and PR unless the owner says otherwise; research, PRD drafting and technical planning do not authorize implementation. If approved scope must expand, obtain approval for the specific change. Review scope, correctness, security, architecture and tests. Record actual evidence on the change, use English Conventional Commits and push before opening the final PR. Link the related Issue, verify CI on the latest PR head and leave issue closure to merge. Never force-push, rewrite the test baseline before implementation verification, bypass protections or merge automatically. Report newly unblocked work without starting it.

## Independent test-first sessions

Every approved task that introduces or changes functional behavior uses two separate Codex conversations. Each role independently reads the approved Issue revision and relevant PRD, plan, accepted ADRs, public contracts and repository evidence. These requirements are authoritative; tests are executable evidence, not replacement requirements. Resolve contradictions before proceeding and never change acceptance criteria to accommodate implementation. Separate conversations reduce shared conversational context but do not guarantee independent reasoning.

Session 1 uses [test-engineer](../.agents/skills/test-engineer/SKILL.md). It verifies dependencies and Git state, creates the task branch, derives observable positive, negative, boundary and failure tests, writes deterministic synthetic fixtures, and runs new and existing tests against the current implementation. It records expected and observed RED, distinguishing behavioral failures from missing contracts or infrastructure. It commits and pushes tests, publishes the [frozen handoff](templates/test-engineer-handoff.md), and stops. It must not implement functionality, fix the target bug, weaken CI or create the final implementation PR. Scaffolding requires explicit approved scope and must remain nonfunctional; unresolved design decisions block independent tests.

The owner reviews the handoff and starts Session 2 in a fresh conversation using [implementation-engineer](../.agents/skills/implementation-engineer/SKILL.md). It verifies the same branch and committed baseline, reproduces applicable RED, implements approved behavior, adds supplementary tests in separate files, refactors and verifies. Frozen tests, fixtures and helpers cannot change without explicit owner approval. An invalid test requires exact evidence, a smallest correction proposal, an approval stop and a recorded replacement baseline. Session 2 reviews the complete diff, verifies baseline integrity, commits, pushes, creates the single final PR and reports CI on its latest head using the [implementation handoff](templates/implementation-engineer-handoff.md). It stops for owner review.

The owner starts the second conversation unless an explicitly authorized supported orchestration mechanism exists. Do not simulate independence by performing both roles in one conversation. No orchestration runtime is introduced. A test-only commit may intentionally contain failing new tests on the task branch; it must never merge incomplete into main. Do not create unnecessary failing PRs merely to demonstrate RED or weaken normal CI.

Example branch: `feat/12-vacancy-deduplication`. Session 1 commits `test: define vacancy deduplication behavior`; Session 2 commits `feat: implement vacancy deduplication`, optionally followed by meaningful refactoring commits. Do not split phases into separate Issues.

Start Session 1:

```text
Use $task-lifecycle and $test-engineer for approved GitHub Issue #N.
Perform the independent test-only phase, commit and push the tests,
produce the frozen test baseline and stop.
```

Start Session 2 in a fresh conversation:

```text
Use $task-lifecycle and $implementation-engineer for approved GitHub Issue #N.
Continue on the existing task branch from the recorded test baseline.
Implement the approved behavior without modifying frozen tests,
verify, commit, push, create the PR and stop for owner review.
```

## Test strategy and proportionate exceptions

Use independent tests for domain rules, normalization, deduplication, transitions, idempotency, source adapters, HTTP contracts, persistence, API behavior, errors, concurrency, retries, provider routing, resource/cost limits, security-sensitive functionality and meaningful user-facing behavior. Bug fixes should reproduce the defect independently before implementation wherever practical. Use Vitest unit and contract tests, deterministic HTTP fixtures, Firestore Emulator integration, Docker smoke checks, Terraform mock providers and Playwright for meaningful browser workflows. Cover requirements rather than coverage statistics; do not introduce arbitrary thresholds. Consider coverage reporting separately when demonstrated value warrants it.

Documentation-only, formatting-only and simple nonbehavioral configuration changes may use one conversation with proportionate verification; record the reason in the handoff/PR. Configuration, infrastructure and CI changes affecting runtime behavior, security, permissions or quality enforcement need meaningful automated verification and independent test-first treatment where practical. Do not classify configuration as automatically exempt or use exceptions to avoid significant behavioral tests. M1.2 uses the explicit process-definition exception because it establishes this methodology; it changes instructions and templates, not product behavior or executable quality gates.

## Enforcement and CI

Follow [frozen baseline verification](test-baseline.md) before implementation and again on its final commit. Git comparisons provide local deterministic integrity checks. Session separation, approval, the protected-path list and requirement completeness are procedural owner-review boundaries; editable handoff metadata is not tamper-proof. GitHub Actions cannot prove that separate Codex conversations occurred.

Keep all existing CI jobs and test discovery. Require applicable checks on the latest PR head: formatting, ESLint, typecheck, architecture, skills, Issue syntax, unit/contract tests, Firestore integration, application builds, container verification, and Terraform validation/mock tests. The existing check job validates the canonical Issue example, not live Issue approval or every Issue body. Review the approved Issue with `pnpm lint:issue <file>` separately. Green CI is necessary but cannot prove semantic correctness; human review remains the final merge boundary.

M1.2 inspected GitHub on 2026-11-27: `main` returned “Branch not protected” (HTTP 404), and the repository ruleset list was empty. Recommended required checks are `Format, lint, typecheck, test, build`, `Integration tests (Firestore Emulator)`, `Container builds`, and `Terraform`, plus required owner review and review of the latest head. No remote settings were changed. Frozen-baseline CI is deferred: current workflows have no independently trusted baseline reference or protected-path manifest. Until that exists, explicit review evidence is required; do not treat an editable PR-body SHA as trusted enforcement.

`pnpm check` runs Prettier, type-aware ESLint, static architecture and skill checks, typecheck and unit tests. Use `pnpm lint:issue <file>` to validate issue syntax, `pnpm build` for app/package changes, Firestore integration checks for adapter/emulator changes, and Docker and Terraform checks for those boundaries. GitHub CI uses pinned actions and no production credentials. Skills, templates and issue validation do not freeze issue bodies, enforce human approvals, lock branches or prove semantic correctness. Record approved revisions, review differences and check CI manually. There is no external workflow runtime.

Retain the frozen lockfile and lifecycle allowlist. Review the dependency necessity, actual resolved changes and scripts, and add an ADR for major structural dependencies. Dependency advisories can be checked with `pnpm audit --prod` when network access is available. Review diffs for secrets and generated material before publishing. Knip is deferred until unused code becomes costly or its intentional adapter entry points can be scoped. Dependabot, CodeQL and hosted secret scanning are not configured here. They affect repository configuration or review load and require a separate owner decision. Avoid arbitrary complexity or nesting thresholds that produce artificial modules.

Treat cloud provisioning, deploys, image pushes, API activation, billing and credential changes as owner-authorized operations. Local mock Terraform and emulator checks are part of normal verification. See [Terraform](../infra/terraform/README.md).
