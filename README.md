# JobScout

JobScout helps a Germany-based candidate discover vacancies and decide which are worth exploring. It proposes `worth_exploring`, `maybe`, or `skip`. The candidate reviews the results and selects jobs for JobFlow, which owns detailed matching, CV adaptation and document generation.

The repository provides an engineering foundation: a Next.js App Router and Material UI shell, a finite Node.js Worker, Zod contracts, a Google ADK TypeScript boundary exercised with a model double, a Firestore adapter with synthetic fixtures, Docker, Terraform validation and GitHub Actions. Production source ingestion, live screening, authentication, cloud infrastructure and JobFlow export are planned.

| Location                         | Responsibility                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `apps/web`                       | Next.js UI and health endpoint, intended for Cloud Run Service                   |
| `apps/worker`                    | Finite bootstrap with a database connectivity check, intended for Cloud Run Jobs |
| `packages/core`                  | Domain schemas, configuration and evidence checks                                |
| `packages/agent`                 | ADK screening integration boundary                                               |
| `packages/firestore`             | Firestore server SDK and guarded emulator tools                                  |
| `infra/local`, `infra/terraform` | Local emulator and resource-free Terraform configuration                         |
| `.agents/skills`, `docs`         | Engineering workflows and product records                                        |

Install Node.js as pinned in `.node-version`, Corepack, and Docker with Compose. Use the project's pinned pnpm.

```sh
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm dev:infra
pnpm db:seed
pnpm dev:web
```

The app runs on `http://localhost:3000`, with health at `/api/health`. The Emulator UI is at `http://127.0.0.1:4000`. Run `pnpm worker:run` for a finite run, `pnpm test:integration` for isolated Firestore tests, and `pnpm dev:stop` when finished. See [local development](docs/local-development.md) for environment variables, seed/reset and container checks.

Run `pnpm check` for formatting, lint, architecture and skill checks, type checking and unit tests. Run `pnpm build` for production builds. Docker commands and the independent Worker smoke test are in the local guide. The [Terraform README](infra/terraform/README.md) describes backend-free initialization and mock tests.

Start Codex work from [AGENTS.md](AGENTS.md) and the [development workflow](docs/development.md). Significant features need owner approval of both the PRD and technical plan before issues and implementation. See the [skill inventory](docs/skills-inventory.md), [engineering standards](docs/engineering-standards.md), [architecture](docs/architecture.md), [decisions](docs/decisions/README.md), [product vision](docs/product-vision.md), [UI plan](docs/ui-ux.md) and [roadmap](docs/roadmap.md).
