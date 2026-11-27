# Local development

Use the Node and pnpm versions pinned in the repository and a running Docker daemon with Compose. Install with `pnpm install --frozen-lockfile`. Start infrastructure separately from the application.

```sh
pnpm dev:infra
pnpm db:seed
pnpm worker:run
pnpm test:integration
pnpm dev:web
```

The Emulator listens on `127.0.0.1:8080` and its UI on `127.0.0.1:4000`. The web app defaults to port 3000. `pnpm dev` starts shared package watchers and the app. `pnpm dev:worker` watches the Worker. Stop the processes you started and use `pnpm dev:stop` to stop the local Compose project when appropriate.

## Configuration

Precedence from highest to lowest is inherited process environment, optional repository-root `.env`, then committed `config/local.env`. Copying `.env.example` is optional. It contains commented settings so it preserves defaults. The explicitly local entry points validate configuration before the app or data command runs and reject any environment other than `local`. Clear inherited variables that belong to a production context. Production containers and the dedicated test harness have separate entry points.

| Variables                                                            | Use                                                                                                                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `JOBSCOUT_ENV`, `GOOGLE_CLOUD_PROJECT`                               | Required. Local defaults are `local` and `demo-job-scout`. Production needs `production` and a project without the demo prefix.                                                            |
| `FIRESTORE_EMULATOR_HOST`                                            | Required in local/test. Forbidden in production. Seed and reset additionally require verified loopback.                                                                                    |
| `JOBSCOUT_PROVIDER_MODE`                                             | Optional outside production, defaults to `offline`. Production defaults to `live_integration`. `live_sources` and `live_integration` are reserved for authorized future integration paths. |
| `JOBSCOUT_AI_MAX_REQUESTS_PER_RUN`, `JOBSCOUT_AI_MAX_TOKENS_PER_RUN` | Positive safe integers, required in `live_integration`.                                                                                                                                    |
| `JOBSCOUT_MOCK_AUTH`                                                 | Optional local/test capability flag; real authentication is planned. Production rejects `true`.                                                                                            |
| `JOBSCOUT_SCREENING_MODEL`                                           | Explicit model ID at the agent boundary; the bootstrap Worker does not invoke the agent.                                                                                                   |
| Provider credentials and `AUTH_*`                                    | Reserved for future server-only integration. API keys, tokens, and OAuth secrets belong in ignored local overrides or future Secret Manager, away from client bundles.                     |

Seed loads only synthetic data and is repeatable for stable IDs. `pnpm db:reset` deletes the configured emulator project's default database after verifying the synthetic ID and endpoint. Run seed again after reset to reseed. Integration tests use `demo-job-scout-test` and reset their own data. Compose persistence is off by default. Set `EMULATOR_PERSIST=true` before starting to import and export the Compose volume on graceful shutdown.

Emulation verifies SDK behavior and local contracts. It does not establish production IAM, composite index requirements, all transaction and size limits, regional availability, latency or Cloud Run scaling. See [Firebase emulator differences](https://firebase.google.com/docs/emulator-suite/connect_firestore#how_the_cloud_firestore_emulator_differs_from_production).

## Verification and troubleshooting

```sh
curl -fsS http://localhost:3000/api/health
docker build -f apps/web/Dockerfile -t job-scout-web:local .
docker build -f apps/worker/Dockerfile -t job-scout-worker:local .
docker compose build firestore-emulator
sh scripts/smoke-worker.sh
```

The Worker smoke test uses a new emulator container on an internal Docker network with no published ports. It runs the compiled image with an offline synthetic test project and removes the test resources it started. The shell script can run from Git Bash on Windows with Docker CLI access. Local commands, integration tests and the Worker smoke test set `METADATA_SERVER_DETECTION=none` to disable Google SDK metadata probing in their respective processes. CI also checks the compiled Web image with `/api/health` and confirms that a production Worker rejects an emulator setting.

For startup failures, inspect `docker compose ps` and `docker compose logs firestore-emulator`; first build downloads emulator binaries. If a port is occupied, identify its owner before stopping anything. For invalid runtime configuration, read the listed fields and check the shell and root `.env`. If the Worker cannot connect, confirm the target host and emulator health. A refused reset or seed means the required local target has not been verified.
