---
name: implementation-verification
description: Task-completion workflow for JobScout. Use before reporting any coding, configuration, infrastructure or documentation task as done - it selects and runs the relevant checks (format, lint, typecheck, tests, build, integration, Terraform, Docker, web smoke test), reviews the diff for secrets and generated artifacts, and reports actual results.
---

# Implementation verification

Never claim a check passed unless it ran in this session and you saw it pass.

## Workflow

1. **Restate acceptance criteria** from the task in 2–6 bullets. Note anything ambiguous.
2. **Inspect the change**: `git status` and `git diff` (plus `git diff --staged`). Confirm
   every changed file is in scope; revert or call out unrelated edits.
3. **Select checks** for the affected surfaces. Run prerequisites before their dependents and fix failures within approved scope. Record exact evidence against the approved criteria and revision.

| When                                                      | Command                                                                                                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| always                                                    | `pnpm format:check` (fix with `pnpm format`)                                                                                                  |
| always                                                    | `pnpm lint`                                                                                                                                   |
| always                                                    | `pnpm typecheck`                                                                                                                              |
| always                                                    | `pnpm test`                                                                                                                                   |
| apps/packages changed                                     | `pnpm build`                                                                                                                                  |
| Firestore code, seed/reset, emulator config               | `pnpm dev:infra` then `pnpm test:integration`                                                                                                 |
| `infra/terraform` changed                                 | in `infra/terraform`: `terraform fmt -check -recursive`, `terraform init -backend=false -input=false`, `terraform validate`, `terraform test` |
| Dockerfile, `.dockerignore`, deps or build output changed | `docker build -f apps/web/Dockerfile -t job-scout-web .` and/or `docker build -f apps/worker/Dockerfile -t job-scout-worker .`                |
| web changed                                               | `pnpm dev:web`, then `curl -fsS http://localhost:3000/api/health`; open changed pages                                                         |
| worker changed                                            | `pnpm dev:infra` then `pnpm worker:run` (expect exit code 0)                                                                                  |

`pnpm check` includes formatting, lint, architecture, skills, typecheck and unit tests. For issue changes also validate the canonical contract. Verify Worker images with `sh scripts/smoke-worker.sh` and report actual PR-head CI results when available. Stop background dev servers you start.

4. **Secret scan of the diff**:
   - no `.env`, `.env.*` (except `.env.example`), `*.tfvars`, `*.tfstate`, `*.pem`, `*.key`,
     `service-account*.json`, `credentials*.json` in `git status`;
   - grep the diff for key-like strings, e.g.
     `git diff | grep -nE "AIza[0-9A-Za-z_-]{30,}|gsk_[0-9A-Za-z]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|\"private_key\"|(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]{8,}"`;
   - no `NEXT_PUBLIC_` variable carrying a secret; no real personal/recruiter data in fixtures.
5. **Generated artifacts**: none of `dist/`, `.next/`, `.terraform/`, `coverage/`,
   `*.tsbuildinfo`, `node_modules/` staged. `.terraform.lock.hcl` changes only when providers
   changed (with all four platform hashes).
6. **Docs sync**: README/`docs/`/ADRs/`AGENTS.md`/skills updated where behavior, commands or
   decisions changed; planned features still labelled planned. New dependency or framework →
   ADR exists.
7. **Scope compliance**: no `terraform apply`, deploys, live provider calls or `live_*` modes
   unless the user authorized them; no weakened safeguards.

## Report format

Use the [canonical verification template](../../../docs/templates/implementation-verification.md) for substantial changes. Code review, owner approval, and manual acceptance are separate from automated checks.

```
Acceptance criteria: <met / not met, one line each>

| Command | Result |
| --- | --- |
| pnpm format:check | passed |
| pnpm test | passed (N files, M tests) |
| pnpm test:integration | not run — Docker not available |
| terraform test | not applicable — infra unchanged |
```

- Use actual outcomes: `passed`, `failed (summary)`, `not run — reason`, `not applicable`.
- List residual risks and anything that needs user action (e.g. checks requiring cloud access).

## References

- https://vitest.dev/guide/cli
- https://developer.hashicorp.com/terraform/cli/commands/test
- https://docs.docker.com/reference/cli/docker/buildx/build/
