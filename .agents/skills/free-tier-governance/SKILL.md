---
name: free-tier-governance
description: Cost and free-tier quota governance for JobScout on Google Cloud and AI providers. Use when changing Cloud Run, Cloud Run Jobs, Scheduler frequency, Firestore access patterns, Artifact Registry, logging, egress, AI request or token budgets, or any resource policy that affects spend or Gemini, Groq or Cloudflare quotas.
---

# Free-tier governance

Principle: Free Tier First. Bounded work, scale to zero, persistent pending work. Never claim
guaranteed zero cost — free tiers, prices and quotas change and some usage is always billable.

## When to use

Before changing anything that scales usage: schedules, batch sizes, page limits, instance
settings, retention, log volume, model choice, AI budgets. Pair with `gcp-terraform`,
`firestore` and `llm-provider-routing`.

## Never hardcode quotas as facts

- Look up current limits on the official pricing/quota pages at the time of the change.
- Record each figure with source URL and retrieval date (in the PR/ADR or docs), and treat it
  as a snapshot. Put numbers in configuration, not code constants.
- If pricing cannot be verified (page unavailable, region-specific), say so and stop before
  changing resource policies.

## Cost drivers to account for

| Area              | Driver                                                | Control                                                                 |
| ----------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Cloud Run service | vCPU-seconds, GiB-seconds, requests                   | min instances 0, request-based billing, small memory, max instances cap |
| Cloud Run Jobs    | task duration × CPU/memory, task count                | bounded workload, timeouts, few tasks, no retries storm                 |
| Cloud Scheduler   | jobs per billing account                              | few schedules, sensible frequency                                       |
| Firestore         | document reads/writes/deletes, storage, index entries | bounded queries, cursor pagination, skip unchanged writes, TTL          |
| Artifact Registry | stored image size                                     | cleanup policies (keep last N, delete untagged)                         |
| Cloud Logging     | ingested volume, retention                            | structured concise logs, no per-item debug in prod, exclusions          |
| Network           | egress from Cloud Run                                 | no large downloads, region co-location                                  |
| AI providers      | requests/min, requests/day, tokens/min/day            | per-run budgets, reservations, deferral                                 |

## Application-level budgets

- `JOBSCOUT_AI_MAX_REQUESTS_PER_RUN` and `JOBSCOUT_AI_MAX_TOKENS_PER_RUN` are mandatory in
  `live_integration` (`loadRuntimeConfig` enforces this). Add similar per-run caps for source
  requests and Firestore writes when those features land.
- Reserve budget before each AI call (estimated tokens), reconcile with actual usage after.
- Track provider reset windows (per-minute vs per-day, timezone) in persisted provider state.
- When a budget or quota is exhausted, stop new work and record remaining items as pending
  work for the next run. Never switch to a paid provider or tier automatically.

## Workflow for a change

1. Identify which drivers the change affects; estimate per run and per month
   (runs/day × items/run × reads/writes/tokens per item).
2. Verify current official pricing and free-tier limits; record URL + date.
3. Compare against the limits with headroom; document the forecast in the PR.
4. Add or adjust caps, timeouts and alerts. Billing budget alerts only notify — they do not
   stop spending; an automatic cap requires a separate, explicitly approved mechanism.
5. No VMs, GKE, Cloud SQL, paid search APIs, or always-on instances.

## Verification

- Tests assert that budgets are enforced (reservation refused when exhausted; pending work
  recorded) using fake clocks and in-memory or emulator state: `pnpm test`,
  `pnpm test:integration`.
- Terraform changes: offline checks per `gcp-terraform`.

## References

- https://cloud.google.com/free/docs/free-cloud-features
- https://cloud.google.com/run/pricing
- https://cloud.google.com/firestore/pricing
- https://cloud.google.com/artifact-registry/pricing
- https://cloud.google.com/stackdriver/pricing
- https://cloud.google.com/scheduler/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/pricing
- https://console.groq.com/docs/rate-limits
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://cloud.google.com/billing/docs/how-to/budgets
