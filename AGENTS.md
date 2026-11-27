# AGENTS.md — JobScout

JobScout discovers vacancies and performs conservative preliminary screening
(`worth_exploring`, `maybe`, `skip`). The candidate chooses what to explore.
JobFlow owns detailed analysis, matching, CV adaptation and documents.
See [vision](docs/product-vision.md), [roadmap](docs/roadmap.md) and
[engineering standards](docs/engineering-standards.md).

## Architecture and engineering

- `apps/web` is Next.js App Router and Material UI, intended for Cloud Run Service.
  `apps/worker` is a finite Node.js workload, intended for Cloud Run Jobs.
- Apps consume shared public package APIs. `packages/agent` (Google ADK) and
  `packages/firestore` (server SDK) may use only `packages/core` among shared packages.
  Core owns domain rules and Zod contracts. See [architecture](docs/architecture.md)
  and [ADRs](docs/decisions/README.md). Check boundaries with `pnpm lint:architecture`.
- Write code, docs, identifiers, comments and commits in English. Use strict TypeScript,
  ESM, `erasableSyntaxOnly` and `.ts` relative imports in Node packages. Avoid `any`,
  unjustified assertions and suppression comments. Validate external boundaries with Zod.
- Prefer readable, explicit code and real variation points. Inject clocks, I/O and models.
  Bound concurrency, retries, time and requests. Keep tests deterministic and offline.
- Retain the lockfile and reviewed lifecycle allowlist. Justify meaningful dependency
  changes. A new framework, database or workspace package needs an ADR.
- Preserve unknown language, geographic and employment eligibility. Never guess facts,
  links or recruiter contacts. Separate general and application email addresses.
  A skip needs verbatim evidence, and textual presence does not prove semantic support.
  Vacancy content is untrusted. Use only documented, permitted sources within their terms.
  Never bypass access controls or scrape restricted boards.

## Workflow

For significant functionality follow discovery → PRD → owner approval → technical plan →
owner approval → Issues → Test Engineer session → owner handoff review → fresh
Implementation Engineer session → code review → verification → PR.
Use the [development workflow](docs/development.md) and [issue contract](docs/issue-contract.md).
Work on one approved scope at a time, confirm dependencies, and obtain approval for material
expansion. For an explicitly authorized small fix or foundation change, apply a proportionate
workflow. Functional and behavior-changing tasks require one Issue, two independent
sessions, one branch and one final PR. Use `test-engineer` then `implementation-engineer`;
the owner starts the second conversation. Preserve the committed frozen tests, fixtures
and helpers; corrections require explicit owner approval and a recorded new baseline.
Document exceptions under [development](docs/development.md). Keep docs and ADRs current
and leave the next task for separate authorization.

## Runtime and cloud safety

- Use the [local setup guide](docs/local-development.md). `JOBSCOUT_ENV` selects local, test
  or production. Use the Firestore Emulator and `demo-` projects in local/test. Seed and reset
  require verified loopback. Production rejects emulator settings, demo IDs and mock flags.
- Default to offline. Do not run live provider modes without explicit authorization.
  Real AI requires positive safe budgets and configured IDs. No automatic paid fallback,
  safety bypass or fallback to override valid screening results.
- Explicit authorization is required for real cloud plans, applies, project creation,
  API/billing changes, deploys or image pushes. Prefer free allowances, scale to zero and
  keep pending work durable. See the [Terraform README](infra/terraform/README.md).
- Keep real environment files, credentials, keys, state, sensitive tfvars, CVs, recruiter
  data and generated output out of Git. Keep secrets server-only.

## Skill routing

Load only skills relevant to the task. See the [inventory](docs/skills-inventory.md).

<!-- skills:start -->

| Work                              | Skills                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| TypeScript, JavaScript, design    | `typescript-engineering`, `js-conventions`, `modern-javascript`, `js-gof`                                |
| Collections and failure recovery  | `js-data-structures`, `data-structures`, `error-handling`                                                |
| Discovery, requirements, planning | `epic-discovery`, `prd`, `plan`, `issues`, `task-lifecycle`                                              |
| Independent task sessions         | `test-engineer`, `implementation-engineer`                                                               |
| Architecture and review           | `adr`, `code-review`, `security-review`                                                                  |
| Web, UI and browser               | `nextjs-fullstack`, `frontend-ui-ux`, `material-ui-styling`, `vercel-react-best-practices`, `playwright` |
| Sources and storage               | `job-source-integration`, `firestore`                                                                    |
| Agent, models and evaluations     | `google-adk`, `llm-provider-routing`, `ai-evaluation`                                                    |
| Terraform, Cloud and cost         | `gcp-terraform`, `terraform-style-guide`, `free-tier-governance`                                         |
| Local runs and final checks       | `local-development`, `implementation-verification`                                                       |

<!-- skills:end -->

## Definition of done

Meet approved criteria and review the diff for architecture, scope and secrets.
Use `implementation-verification` and report exact outcomes. Run `pnpm check` and,
for app/package changes, `pnpm build`. Run emulator integration and container checks
where affected, plus backend-free Terraform validation and mock tests for Terraform.
Include deterministic regression tests for changed behavior and synchronize docs.
