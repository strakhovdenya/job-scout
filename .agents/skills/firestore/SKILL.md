---
name: firestore
description: Firestore Native data modeling and access for JobScout through packages/firestore. Use when designing collections or document IDs, writing queries, transactions or batches, indexes, pagination, retention, seeding, or Firestore Emulator integration tests, or when touching packages/firestore/src.
---

# Firestore (packages/firestore)

## When to use

Any read/write of Firestore, data model design, seed/reset, or `*.integration.test.ts`.
Emulator start/stop and troubleshooting → `local-development`. Indexes in IaC → `gcp-terraform`.

## Current state

- `createFirestore(config, env)` — the only way to obtain a client. It refuses to start when
  `FIRESTORE_EMULATOR_HOST` in the process env disagrees with the validated `RuntimeConfig`
  (the SDK switches to emulator mode implicitly).
- `checkFirestoreConnectivity` — bounded probe. `assertLocalEmulatorTarget` / `probeEmulator`
  / `resetEmulatorDatabase` — destructive operations only on loopback emulator + `demo-` project
  - local/test environment. Do not weaken these guards.
- `COLLECTIONS` in `seed.ts` holds collection names; only `vacancies` exists. The full model
  is designed in milestone M2.

## Planned collections (design target, not implemented)

companies, sources, vacancies, vacancy description versions, deduplication state, screening
results, search profiles, user vacancy state (saved/dismissed), executions (run records),
pending work, provider quota/breaker state, resource accounting. Add each one only when a task
needs it, centralized in `COLLECTIONS`, with a Zod schema in `packages/core`.

## Modeling rules

- Deterministic document IDs for idempotency: e.g. `sha256(sourceId + ':' + externalId)` (hex,
  truncated consistently) for vacancies; fixture IDs (`syn-001`) for seeds. Re-runs overwrite
  or merge, never duplicate.
- Validate on write and on read with Zod; Firestore data is an external boundary.
- Model for the queries you run: denormalize small read-mostly fields; no relational joins,
  no N+1 fan-out in list views.
- No unbounded arrays or maps in a document; use subcollections or separate documents.
  Documents are limited to 1 MiB — store large descriptions once, versions separately, and
  only hashes in hot documents.
- Timestamps as Firestore `Timestamp`/ISO consistently; clocks injected.
- Retention: prefer bounded cleanup with a measured read/delete budget and durable checkpoints. Expire pending work only under an explicit recovery policy. Firestore TTL deletes have no free usage allowance and require billing. No production TTL policy exists. Verify current [pricing](https://firebase.google.com/docs/firestore/pricing) before proposing retention.

## Access patterns

- Cursor pagination (`orderBy` + `startAfter(lastSnapshot)` + `limit`), never `offset`
  (offset still bills skipped reads).
- Every query is bounded with `limit`. Composite indexes required by new queries are listed in
  the PR and later declared in Terraform.
- Transactions for read-modify-write (quota reservations, dedup claims); keep them short, no
  external I/O inside. Batches/transactions have per-commit write limits — chunk large writes.
- Cost awareness: every document read/write/delete is billed; prefer `count()` aggregations,
  field masks (`select`), and avoiding re-writes of unchanged documents (compare content hash).
- Avoid hot-spotting: no monotonically increasing document IDs at high write rates.

## Emulator and tests

- local data: project `demo-job-scout`; integration tests: `demo-job-scout-test`, reset in
  `beforeEach` and `afterAll` (see `firestore.integration.test.ts`); tests run serially.
- The emulator does **not** reproduce: IAM/security, index requirements (queries that need a
  composite index succeed locally), production transaction contention semantics, quotas,
  billing or regional latency. Note which behaviors still need verification in the cloud.

## Verification

```sh
pnpm test                    # unit (guards, mapping)
pnpm dev:infra && pnpm test:integration
pnpm db:seed                 # optional manual check in the Emulator UI http://127.0.0.1:4000
```

## References

- https://firebase.google.com/docs/firestore/manage-data/structure-data
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/firestore/best-practices
- https://firebase.google.com/docs/firestore/query-data/query-cursors
- https://firebase.google.com/docs/firestore/ttl
- https://firebase.google.com/docs/emulator-suite/connect_firestore
- https://cloud.google.com/nodejs/docs/reference/firestore/latest
