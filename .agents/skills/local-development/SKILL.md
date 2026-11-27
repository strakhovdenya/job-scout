---
name: local-development
description: Start, debug, test and reset the JobScout local environment (Docker Firestore Emulator, seed and reset, Next.js dev server, worker run, integration tests, config layering and provider modes). Use when setting up the repo, running anything locally, troubleshooting the emulator or local config, or when a task needs local data.
---

# Local development

Local tools never point at production. Never disable or bypass safeguards (`loadRuntimeConfig`,
`createFirestore`, `assertLocalEmulatorTarget`, the emulator entrypoint `demo-` check).

## Prerequisites

- Node.js version from `.node-version` (24.x); pnpm via Corepack (`corepack enable pnpm`),
  version from `packageManager`.
- Docker with Compose (Docker Desktop on Windows/macOS) running.
- `pnpm install --frozen-lockfile`.

## Configuration layering

1. `config/local.env` — committed non-secret defaults (`JOBSCOUT_ENV=local`,
   `JOBSCOUT_PROVIDER_MODE=offline`, `GOOGLE_CLOUD_PROJECT=demo-job-scout`,
   `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`).
2. Root `.env` (gitignored, optional) — local overrides and secrets.
3. Variables already set in the process environment win over both.

Scripts load the files via `node --env-file=config/local.env --env-file-if-exists=.env`.
A notice that `.env` was not found is harmless.

Provider modes: `offline` (default; fixtures, mock AI, no external calls) → `live_sources`
(permitted vacancy APIs) → `live_integration` (real AI; requires
`JOBSCOUT_AI_MAX_REQUESTS_PER_RUN` and `JOBSCOUT_AI_MAX_TOKENS_PER_RUN`). Use live modes only
when the user asks.

## Daily workflow

```sh
pnpm dev:infra      # Firestore Emulator 127.0.0.1:8080, Emulator UI http://127.0.0.1:4000
pnpm db:seed        # synthetic vacancies into demo-job-scout (idempotent)
pnpm dev:web        # builds packages, Next.js on http://localhost:3000
pnpm worker:run     # one finite worker run; exit code 0 on success
pnpm test:integration   # uses isolated project demo-job-scout-test, resets per test
pnpm dev:stop       # docker compose down
```

`pnpm dev` runs package watchers plus the web app; `pnpm dev:worker` runs the worker in watch
mode.

## Reset and persistence

- `pnpm db:reset` deletes all documents of the configured project. It refuses unless:
  environment is `local`/`test`, Firestore mode is emulator, project starts with `demo-`, host
  is loopback, and the endpoint answers like the emulator (`Ok` probe).
- Data is ephemeral by default. To keep it: `EMULATOR_PERSIST=true pnpm dev:infra`; data is
  imported on start and exported on graceful stop (`pnpm dev:stop`; compose allows 60 s). On
  Windows PowerShell set `$env:EMULATOR_PERSIST='true'` first.
- Wipe the persisted volume: `docker compose down --volumes`.

## Troubleshooting

| Symptom                                       | Check                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `pnpm dev:infra` fails: port 8080/4000 in use | find the process using the port and stop it, or stop an older emulator container |
| Docker errors / cannot connect                | start Docker Desktop / the daemon, then retry                                    |
| container unhealthy or slow start             | `docker compose ps`, `docker compose logs firestore-emulator`                    |
| worker exits 1 with connectivity timeout      | emulator not running → `pnpm dev:infra`                                          |
| `Invalid runtime configuration`               | read the listed issues; fix `.env`/shell vars, do not loosen validation          |
| `Refusing to modify data` on reset/seed       | target is not a loopback `demo-` emulator — intended safeguard                   |
| integration tests fail to connect             | emulator not running, or `FIRESTORE_EMULATOR_HOST` overridden in shell           |
| first `dev:infra` is slow                     | image build downloads emulator binaries once                                     |

## Verification

After setup: `pnpm check`, `pnpm dev:infra && pnpm test:integration`, `pnpm worker:run`
(exit 0), `curl -fsS http://localhost:3000/api/health` with `pnpm dev:web` running. Report
results via `implementation-verification`.

## References

- https://firebase.google.com/docs/emulator-suite
- https://firebase.google.com/docs/emulator-suite/connect_firestore
- https://nodejs.org/api/cli.html#--env-filefile
- https://docs.docker.com/compose/
- https://nodejs.org/api/corepack.html
