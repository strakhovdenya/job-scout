---
name: job-source-integration
description: Vacancy source adapters for JobScout (official job APIs, ATS job board APIs, XML and RSS feeds). Use when evaluating a new job source, writing or changing a fetcher, parser or normalizer, pagination, rate limiting, deduplication, change detection, vacancy lifecycle, application link or contact extraction, or source fixtures.
---

# Job source integration

## Hard prohibitions

- Only documented, permitted public APIs/feeds whose terms allow this use.
- Never scrape LinkedIn, Indeed, StepStone or other restricted boards. Never bypass auth,
  CAPTCHA, robots.txt, paywalls or rate limits; no rotating IPs or spoofed browsers.
- Never invent vacancy facts, contacts, languages or remote eligibility.

## Step 1 — feasibility check (milestone M0) before any code

Verify from the official docs and terms, and record findings with source URL + date
(e.g. in `docs/` or an ADR):

1. Public accessibility and authentication requirements.
2. Permission to fetch, store and display (terms, attribution, retention limits).
3. Full description available, or only a teaser?
4. Coverage of German and Ukrainian employers; remote-geography information.
5. Language information present? Application URL and/or application email present?
6. Rate limits, pagination, stability/versioning, change notifications.

Candidate sources (all **unverified**; check before use): Arbeitnow, Jobicy, Greenhouse Job
Board API, Ashby Job Posting API, Lever Postings API, Personio XML feeds, DOU RSS.

## Step 2 — adapter contract

`fetch → validate (Zod) → normalize → persist`:

- Fetch: `fetch` injected; `AbortSignal.timeout`; explicit pagination bound (max pages/items
  per run) and stop on empty page or repeated cursor.
- Validate the raw payload with a source-specific Zod schema; reject or quarantine invalid
  items individually, never the whole run.
- Normalize to the shared vacancy model in `packages/core` (model finalized in M2; today only
  `vacancyScreeningInputSchema`). Keep the original text; locations as source text.
- XML/RSS: use a maintained parser only after dependency review; disable external entities;
  treat HTML in fields as untrusted (sanitize before display, see `security-review`).

## Network etiquette and safety

- Allowlist of hosts per source; refuse redirects or URLs outside it (SSRF). Never fetch URLs
  found inside vacancy text.
- Polite `User-Agent` identifying JobScout generically — no personal names or emails.
- Respect `Retry-After`; per-source rate limit; retries only for idempotent GETs with bounded
  exponential backoff and jitter.
- Track source health (last success, consecutive failures, last error class) and disable a
  source automatically after repeated failures.

## Identity, change detection, dedup

- Stable ID = source + external ID → deterministic document ID (see `firestore`).
- Content hash over normalized significant fields to detect changes; store description
  versions only when the hash changes.
- Lifecycle: `new` → `changed` → `closed` (missing from a complete listing or explicitly
  closed). Do not mark closed on a partial/failed fetch.
- Cross-source dedup: same company + normalized title + near-identical description; see
  fixtures `syn-001`/`syn-002` (aggregator repost with different title/whitespace). Keep both
  records and link them; never merge away the source of the application link.

## Application links and contacts

- Extract only what the source states. A general inquiry email (`generalContactEmail`) is not
  an application email. Missing → `null`, never guessed from domain patterns.

## Testing

- Offline by default: recorded/hand-written fixtures under `fixtures/` with `.example`
  domains, no real personal or recruiter data. Fake `fetch` in unit tests.
- `live_sources` mode only when the user explicitly asks; never in CI.

## Verification

```sh
pnpm test && pnpm lint && pnpm typecheck
pnpm test:integration   # when persistence changes (needs pnpm dev:infra)
```

Then `security-review` (SSRF, sanitization) and `implementation-verification`.

## References

Start from the provider's own site and locate the current API/feed docs and terms there:

- https://www.arbeitnow.com
- https://jobicy.com
- https://developers.greenhouse.io/job-board.html
- https://developers.ashbyhq.com
- https://github.com/lever/postings-api
- https://developer.personio.de
- https://dou.ua
- https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
