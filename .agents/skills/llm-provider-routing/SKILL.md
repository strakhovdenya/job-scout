---
name: llm-provider-routing
description: Planned design for routing JobScout screening requests across AI providers (Gemini primary, Groq-hosted GPT-OSS fallback, optional Cloudflare Workers AI). Use when implementing or reviewing provider selection, fallback, retries, error classification, circuit breakers, quota or token accounting, AI budgets, or OpenAI-compatible model adapters.
---

# LLM provider routing (planned)

Status: **design only — nothing is implemented.** `screenVacancy` currently runs one model
from `JOBSCOUT_SCREENING_MODEL`. Implement routing only when a task asks for it, and record the
design in an ADR under `docs/decisions/`.

## When to use

Any work on choosing between providers, retry/fallback behavior, provider health, AI budgets,
or adapters for non-Gemini providers. ADK mechanics → `google-adk`; quotas and cost →
`free-tier-governance`; quality comparison → `ai-evaluation`.

## Intended providers

| Role     | Provider                   | Integration                                                                               |
| -------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| Primary  | Gemini Flash-Lite family   | ADK built-in Gemini model                                                                 |
| Fallback | Groq-hosted OpenAI GPT-OSS | custom `BaseLlm`, OpenAI-compatible base `https://api.groq.com/openai/v1`                 |
| Optional | Cloudflare Workers AI      | custom `BaseLlm`, base `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1` |

- Model IDs come only from configuration; re-verify each against the provider's current model
  list before configuring. Never hardcode IDs or quota numbers.
- ADK TS has no LiteLLM/OpenAI class; write one small `BaseLlm` subclass for the
  OpenAI-compatible chat API, validate responses with Zod, test with a fake `fetch`.
- API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN`) are server-only secrets.

## Error classification (drives every decision)

| Class             | Examples                               | Action                                                                                    |
| ----------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| `rate_limited`    | HTTP 429 with retry hint               | wait/backoff within budget, then fallback if eligible                                     |
| `quota_exhausted` | daily/monthly quota error              | open breaker until reset window; fallback or defer                                        |
| `transient`       | 5xx, network error, timeout            | bounded retry with jittered backoff, then fallback                                        |
| `invalid_output`  | bad JSON, schema violation             | one retry or fallback; count as quality signal                                            |
| `safety_refusal`  | provider safety block                  | **no fallback**; record the refusal, never turn it into `skip`, surface for manual review |
| legitimate result | valid `skip`/`maybe`/`worth_exploring` | final — never re-ask another provider                                                     |
| `config_error`    | 401/403, unknown model                 | fail fast, alert, no retry                                                                |

## Rules

1. Never fall back automatically to a paid provider or paid tier; fallback targets must be
   explicitly configured free-tier options.
2. Never use fallback to override a valid screening result or to bypass a safety refusal.
3. Retries are bounded (attempt count and total time) and use the run's `AbortSignal`.
4. Circuit breaker per provider/model with state persisted in Firestore (planned provider
   quota state collection, see `firestore`) so separate Cloud Run Job executions share it.
5. Reserve request/token budget **before** each call; record actual usage after. Stop when
   `JOBSCOUT_AI_MAX_REQUESTS_PER_RUN` / `JOBSCOUT_AI_MAX_TOKENS_PER_RUN` are reached.
6. When all eligible providers are exhausted, defer the vacancy to persistent pending work
   instead of failing or dropping it.
7. Live calls only in `live_integration` mode (budgets are mandatory there, enforced by
   `loadRuntimeConfig`) and only when the user asks.
8. Log provider, model ID, error class, attempt and token usage — never prompts with personal
   data or API keys.

## ADK `RoutedLlm`

`RoutedLlm({ models, router })` can host the selection logic. The router is re-invoked when a
model throws **before its first yield**; errors after streaming starts are not rerouted.
Verify this against `node_modules/@google/adk/dist/types/models/routed_llm.d.ts` and source
before relying on it. Keep classification and breaker logic in plain, testable functions.

## Tests

Deterministic only: `BaseLlm` doubles that throw classified errors or return canned output,
fake clocks for backoff and breaker timing, in-memory state for unit tests and the emulator
for persisted breaker state (`pnpm test:integration`).

## References

- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://console.groq.com/docs/openai
- https://console.groq.com/docs/rate-limits
- https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://github.com/google/adk-js
