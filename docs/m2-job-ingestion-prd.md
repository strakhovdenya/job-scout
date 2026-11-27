# PRD: M2 — Job ingestion and normalization

- **Date:** 2026-11-27 (Europe/Warsaw)
- **Status:** Approved — product owner, revision 1, 2026-11-27; technical planning deferred pending a separate engineering workflow improvement task.
- **Affected modules:** `apps/worker`, `packages/core`, `packages/firestore`; local configuration, synthetic fixtures and documentation. No Web implementation is required.
- **Related epic or issue:** M2 in the [roadmap](roadmap.md); unfiled, no Issues created.

## Owner approval record — revision 1

The product owner explicitly approved **M2 PRD revision 1 for technical planning** on **2026-11-27**, with the decisions below. This records approval of revision 1; it does not introduce a new product revision. References to proposals in the original requirements are resolved by this record.

| Decision                    | Approved disposition                                                                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experimental weekly targets | At least 10 newly discovered unique, manually plausible technical vacancies per week, including at least three with explicit evidence of remote-work eligibility from Germany. Initial backlog remains separate. |
| Ukrainian employer coverage | A separate important metric, not a blocking requirement for the initial pilot.                                                                                                                                   |
| Pilot design                | Accept 14 days and two manual collection passes per day. This accepts the experimental design; it does not authorize activation or a start date.                                                                 |
| Practical usefulness        | Evaluate manual review, would-explore counts and review time. Defer any mandatory numerical usefulness threshold until pilot activation.                                                                         |
| Jobicy retention            | Accept deletion no later than pilot end plus seven days.                                                                                                                                                         |
| Himalayas                   | Conditional on verified source-specific permissions, retention, deletion and status-check requirements.                                                                                                          |
| Jobicy-only readiness       | Acceptable; Himalayas must not delay it.                                                                                                                                                                         |
| Inspection                  | CLI-based vacancy inspection for M2; complete UI deferred to M4.                                                                                                                                                 |

Subsequent technical planning must prioritize simplicity, readability, maintainability and practical value within the existing architecture and engineering standards. Avoid speculative abstractions, generic policy engines, plugin frameworks, excessive persistence models, unnecessary analytics infrastructure and premature optimization. Deduplication must be deterministic, without embeddings or vector databases.

**Planning hold:** Technical planning is approved in principle but must not start in this session. A separate engineering workflow improvement task must be completed first. This approval-recording task does not start that task. No functionality implementation, Issues, live-source activation or pilot execution is authorized here. The later technical plan still requires its own owner approval before implementation work.

**Publication update (2026-11-27):** M1.2 has merged into main. This records completion of the workflow milestone referenced above. M2 technical planning remains a separate task.

## Goal

Let the candidate manually collect and inspect a bounded set of permitted vacancies locally, with trustworthy provenance, repeatable updates and explicit uncertainty. Prepare a separately authorized 14-day experiment to measure whether discovery is useful; do not claim reliable market coverage from M0 samples.

## Context and project alignment

The owner accepts [M0](m0-data-source-feasibility.md) as a completed feasibility investigation and authorizes this PRD. That acceptance is not source activation, implementation approval or evidence of sustainable vacancy supply. The original M0 observations and limitations remain historical evidence.

The [vision](product-vision.md) prioritizes German employers, remote roles eligible from Germany and Ukrainian employers accepting candidates abroad. Preliminary discovery belongs to JobScout; detailed candidate matching, analysis and documents belong to JobFlow. Candidate language proficiency is unspecified. M2 neither assigns screening outcomes nor calls models.

Repository inspection confirms that [Worker](../apps/worker/src/worker.ts) currently checks configuration and database reachability only. [Core](../packages/core/src/vacancy.ts) has a screening input, not an ingestion contract; [Firestore](../packages/firestore/src/seed.ts) has synthetic seeding, not ingestion repositories. [Local setup](local-development.md) supports an Emulator, but durable Compose persistence is opt-in. No source registry, real adapter, ingestion history or vacancy inspection command exists yet.

The proposed scope fits [architecture](architecture.md) and accepted [ADRs 001–007](decisions/README.md): a finite Worker, pure Core contracts and rules, Firestore behind its public API, offline fixtures and bounded work. No new framework, database, workspace package, scheduler or company registry is justified. Basic ingestion execution history is operational evidence here; the M4 inbox, source-management UI and user workflows remain deferred.

## Dependencies

| Dependency                           | Current status and consequence                                                                                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0 investigation and owner direction | Accepted for feasibility; its source comparisons do not authorize other sources. Owner choices below supersede the report's pending product questions.                                                               |
| M1/M1.1 foundation                   | Present in the inspected repository; ingestion persistence, normalization and local commands still need implementation and verification. No remote CI status is asserted.                                            |
| Jobicy rights                        | Official API use supports the proposed private ingestion, subject to attribution and availability rules below; recheck before activation.                                                                            |
| Himalayas rights and lifecycle       | Conditional. Its expiry obligations must be enforceable for retained content and derivatives. Unresolved relevant permission blocks this source, not Jobicy.                                                         |
| Local persistence and privacy        | Emulator with a verified local synthetic project; isolated, ignored real-data storage and restart continuity must be demonstrated before the pilot. Synthetic reset/seed must not erase pilot evidence accidentally. |
| Approval sequence                    | PRD revision approval → technical plan → plan approval → Issues/task implementation → review/verification. Pilot activation needs separate authorization after readiness evidence.                                   |
| Engineering workflow improvement     | Required by the owner before M2 technical planning starts; completion is not established in this task. PRD revision 1 is approved, but planning remains deferred.                                                    |

### Current official source review

Reviewed **2026-11-27**, using official documentation and terms only. These are documented statements, not new endpoint experiments or legal opinions. No vacancy API collection, provider outreach or AI processing was performed for this PRD.

| Source    | Permission assessment for this scope                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jobicy    | API rules permit storage without a fixed retention limit and analysis/derived outputs. Display requires source credit; closed records must be unavailable. The general terms exempt official API use from the harvesting prohibition. This supports private M2 ingestion, not an unrestricted dataset licence. [API fair use](https://jobicy.com/jobs-rss-feed), [general terms](https://jobicy.com/terms-and-conditions).                   |
| Himalayas | Clauses 30A/113 permit documented API integrations and caching, require attribution and the supplied application destination, restrict third-party redistribution and require expired-job removal. They do not settle indefinite retention of vacancy-level derivatives. M2 proposes deletion of those derivatives with the source record, with activation conditional on an adequate policy. [Official terms](https://himalayas.app/terms). |

Jobicy's [official API repository](https://github.com/Jobicy/remote-jobs-api) describes a seven-day publication window and cursor continuation; its page-size claim differs from the live reference. Use the conservative maximum of 100 records per pass. The [live reference](https://jobicy.com/jobs-rss-feed) documents a 24-hour cursor, optional authentication, free Jobicy destinations, batched status checks of up to 100 IDs, and `active`/`closed`/`unknown`. Routine status synchronization is hourly or less frequent; the documented shared ceiling is 30 requests/second. The proposed pilot is substantially below that ceiling and uses no paid credentials.

Himalayas' [API reference](https://himalayas.app/docs/remote-jobs-api) permits anonymous reads, browse pages up to 20 with cursors, and filtered search pages. A short search page is not an exhaustion signal. Single-job lookup returns 200 open, 410 closed or 404 not found. It offers an alternative to crawling protected job pages. Anonymous allowance is shared; do not treat the optional key's 60/minute and 10,000/day allowance as an anonymous guarantee. The [data dictionary](https://himalayas.app/docs/data-dictionary) defines `pubDate` as last update and `expiryDate` as the latest listing time, with earlier closure possible. Country restrictions and timezone restrictions remain separate source assertions.

JobFlow export and external AI processing stay disabled for both sources. Permission for an excluded future use need not block Jobicy ingestion; unresolved rights for a use actually required by this pilot do block that source. Recheck references and any conflicts before source activation; stop affected use if rights are withdrawn or become unresolved.

## User scenarios

1. The owner inspects local source settings before a run. Jobicy is the intended first source; Himalayas is disabled with an explicit reason until its gate is satisfied. Offline mode makes no external requests even if a source is enabled.
2. After separate live-source authorization, the owner starts one finite local pass. The result shows processed records, changes, validation failures, request use and whether traversal was bounded or incomplete.
3. The owner repeats the pass or restarts after a partial persistence failure. Previously committed vacancies remain stable; repeated observations do not become new jobs or duplicate revisions.
4. The candidate inspects a paginated local list and one vacancy's details, reads source text and uncertainty, and opens the original destination manually. Unknown German eligibility or missing email does not exclude the vacancy.
5. The owner reviews weekly pilot aggregates and records whether opportunities deserved further exploration and how much review effort they required. Initial backlog and later discovery remain distinct.

## In scope

- Local source configuration and source-specific permission/retention records.
- Jobicy API ingestion; conditional Himalayas API ingestion as an independent extension.
- Bounded requests, validation, normalization, source identity/provenance and idempotent local persistence.
- Significant changes, conservative duplicate links, availability evidence and source-specific deletion.
- Source health, finite execution history, manual local commands and basic local inspection.
- Pilot measurement and an explicit proposal for separately authorized observation.

## Out of scope

- Real LLM calls, full AI screening, semantic extraction of requirements, provider routing and candidate matching.
- JobFlow integration or data transfer, automatic applications and recruiter outreach.
- Complete production UI, inbox/search profiles, production authentication and public vacancy display.
- Google Cloud provisioning, Terraform resources, deploys, image pushes and paid services.
- Restricted scraping, browser harvesting, extra source adapters, company onboarding/ATS discovery or a generic plugin framework.
- Production scheduling or a resident polling process. The two daily passes are a manual pilot cadence.
- Mandatory direct employer links, recruitment emails or Ukrainian-employer yield for first-pilot readiness.

## Key invariants and variation points

| Invariant                                                                                    | Actual variation point and existing boundary                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity and original application provenance survive normalization and deduplication. | Jobicy versus Himalayas fetch/validate/normalize behavior in the Worker; shared domain contracts in Core. No runtime plugin system.                           |
| Only permitted operations run; unknown permission fails closed for that operation/source.    | Per-source usage, retention, deletion, status and attribution policies. These govern Worker behavior and Firestore retention, not separate product platforms. |
| Absence is not closure; normalized facts never invent eligibility, language or contacts.     | Documented source fields/status semantics and manually recorded evidence. No candidate-matching strategy variation in M2.                                     |
| Re-observation is idempotent and cannot inflate novelty or versions.                         | Significant-content comparison and conservative duplicate rules in Core; persistence remains in Firestore.                                                    |
| Execution is finite and offline by default.                                                  | Injected HTTP, clock and persistence at current application/package boundaries; configured filters and strictly bounded budgets.                              |

No variation point for database, AI provider, export destination, scheduling backend or UI framework in this scope. Exact algorithms, collections, indexes, CLI syntax and module layout belong to the later technical plan.

## Technical constraints

Follow [engineering standards](engineering-standards.md), existing strict TypeScript/Zod contracts and public package boundaries. Agent and Firestore may depend only on Core among shared packages. Do not put HTTP or SDK dependencies into Core or source I/O into the agent. Existing screening and synthetic fixture contracts must continue to work; an ingestion record need not have enough description to satisfy the screening input.

Local/test writes use the Emulator and `demo-` projects, with verified loopback for pilot data operations. Real records, descriptions, contacts, private review notes and generated output stay outside Git, fixtures and CI artifacts. Repository fixtures use synthetic descriptions and `.example` contacts only. Public portfolio material uses synthetic demonstrations and non-identifying aggregate metrics.

## Functional requirements

### FR-01 — Source configuration and permission gate

Each source has a stable key, enabled state, filters, effective budgets, allowed HTTPS hosts and documented usage policy. Policy records include official references, verification date, intended private use, collection/storage/display permissions, attribution, retention/deletion obligations, and explicit disabled export/AI uses. A configured endpoint is not evidence of permission.

The local command shows the effective configuration and blocking reasons without secrets. Invalid, missing or unresolved required policy prevents external calls for that source. Only Jobicy and a gated Himalayas are supported; all M0 ATS and other aggregator samples remain research. Owner disablement, permission blocking and automatic failure suspension are distinguishable. Policy changes do not silently reactivate a suspended source.

### FR-02 — Bounded collection

Propose two manual passes per day, separated by approximately 12 hours, at a consistent minute other than minute 00. A pass processes at most **100 returned feed records per source**, including duplicates and invalid records; it does not fetch extra pages to replace rejects. Start conservatively with **at most two feed pages per source per pass**, shared across all filters. Thus two Himalayas browse pages can return only 40 records; 100 is a ceiling, not a target.

Each pass declares positive finite request, byte, item, retry and elapsed-time budgets before networking. The plan must choose exact byte/time ceilings and status-request allocations within this product envelope; no live pilot is ready until those values and storage capacity are reviewable. Only one request is in flight. At most one retry per idempotent GET is allowed, honoring `Retry-After` and bounded backoff; waiting beyond the remaining deadline defers work instead. Retry attempts count against request/byte/time budgets and never expand the record allowance.

Feed and status requests have separate counters and ceilings, plus a total request ceiling. Status responses cannot discover additional vacancies. For Jobicy, budget status batches against all retained records requiring confirmation. For Himalayas, admission must be small enough that its per-job checks and deletion obligations can be met within the approved status budget. If not, defer admission or keep the source disabled. No hidden unlimited status sweep, filter fan-out or follow-up detail crawling.

Stop on documented exhaustion, repeated cursor/page, deadline, byte/item/page limit or cancellation, and report the stop reason. Preserve opaque cursors with unchanged filters. A short Himalayas search result is not sufficient evidence of exhaustion. A bounded traversal is not a complete market inventory. Fresh passes overlap the source window rather than treating a cursor as a durable novelty watermark.

### FR-03 — Validation and normalized vacancy contract

Validate the response envelope and each item at the external boundary. One malformed item is rejected independently with a safe reason; valid siblings continue. An unusable envelope fails that fetch. Do not persist rejected raw payloads as a diagnostic archive.

The shared contract must express these observable facts; this is a product field inventory, not a finalized schema:

| Information            | Required behavior                                                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity               | Source key, source external identifier and stable source-record identity; Jobicy ID and Himalayas `guid` are source identities, not employer identities. Missing identity rejects the item.                                                                                                              |
| Origin                 | Source name, canonical listing/source URL, attribution reference, observation/run provenance and applicable policy revision.                                                                                                                                                                             |
| Vacancy text           | Nonempty title and employer name; original permitted description and source location wording. Description availability is full-as-supplied, excerpt-only or missing, never an invented completeness claim.                                                                                               |
| Dates                  | First/last observed time, source publication/update time with its documented meaning, expiry where supplied, significant-change time and availability-check time. Missing dates remain unknown.                                                                                                          |
| Geography and language | Employer-country/origin evidence, work-location assertions, remote restrictions, timezone restrictions and contractual eligibility are separate. Posting language is not required candidate language. Preserve ambiguous prose for review; do not implement M3 semantic language/eligibility extraction. |
| Application            | Supplied destination and its known kind (aggregator, employer/ATS or unknown); separately nullable explicit application and general inquiry email facts. Missing facts stay missing.                                                                                                                     |
| Processing state       | Content revision/change evidence, duplicate links with reasons, availability evidence, source-policy visibility/deletion state and pilot review facts where permitted.                                                                                                                                   |

Missing optional fields, description or application destination do not fabricate substitutes or automatically reject an otherwise identifiable record. Inspection visibly explains the limitation. Malformed optional URLs are unusable, with a diagnostic, rather than rendered as executable links. Preserve original application values where safe and permitted; do not strip meaningful query parameters or replace aggregator destinations with links extracted from prose. Himalayas Apply always uses its supplied `applicationLink`. Direct links or application emails are desirable, never acceptance prerequisites. Structured contact facts are populated only when explicitly supplied with a known purpose; free-text contact interpretation remains manual/M3 work.

### FR-04 — Idempotency and modifications

The same source plus external ID always refers to one source record. A repeat or overlapping pass updates observation metadata without creating a new vacancy. Significant changes include title, employer, description, geography restrictions, employment facts and supplied destinations. Observation/run timestamps and response ordering alone are not content changes.

Significant-content comparison records a changed revision only once, preserving previous text only where policy permits. Cosmetic whitespace/HTML formatting changes must not inflate modified-vacancy metrics; source text may still be refreshed. Source timestamp changes alone are reported separately from content modifications. Replays and recovery after partial writes do not reset first-seen time, duplicate revisions or count an item twice in committed run metrics. Concurrent local passes cannot corrupt identity or overwrite newer accepted observations silently; reject an overlapping run or serialize its work.

### FR-05 — Conservative cross-source duplicates

Keep source records and their destinations intact. Link high-confidence duplicates only when employer identity/name, normalized title and near-identical substantive description agree; generic boilerplate or employer/title equality alone is insufficient. Preserve the reason and participating source records. Ambiguous pairs remain separate and reviewable.

With Jobicy alone, cross-source duplicate behavior is verified using synthetic fixtures, not by activating another source. A linked group counts once for pilot yield; manual duplicate adjudication is recorded separately from automated links. Changed records trigger reassessment without erasing source history. Duplicate grouping must not transitively combine unrelated roles, transfer geography evidence between different roles or transfer application links between sources. Removing restricted source content also removes its duplicate evidence.

### FR-06 — Availability, retention and deletion

Represent source-confirmed open, source-confirmed closed/expired and unknown availability separately from visibility and observation freshness. Store evidence and time; “closed” means the listing is unavailable according to the source, not proof that someone was hired. Disappearance from either aggregator feed, partial traversal, empty filtered results or a failing run never establishes closure.

Jobicy status `closed` hides the listing from active results; `unknown` hides or labels it unconfirmed without inventing closure. A previously open record beyond its configured confirmation interval is visibly stale/unconfirmed. Explicit reopening under the same identity changes availability but is not a new vacancy.

For Himalayas, 410 or a reached `expiryDate` makes content unavailable and triggers policy deletion. A 404 means unconfirmed/not found, not confirmed filled; conservatively remove its cached listing rather than retain an indefinite archive. Missing/invalid expiry blocks admission unless an approved alternative deletion policy covers it. A failed/stale confirmation hides the record pending compliant revalidation. Inspection must not show a retained Himalayas job as current without the required per-job confirmation under the approved freshness policy.

Proposed pilot retention: Jobicy content and vacancy-level review history are deleted no later than seven days after pilot end, or earlier on owner deletion/rights withdrawal; this is a minimization choice, not a provider-imposed limit. For Himalayas, remove expired/unavailable source content, descriptions, versions, contacts, quotes and vacancy-level derivatives together; do not retain a full-record tombstone. Retain only non-identifying aggregates if that use is established as permitted. Otherwise omit those aggregates and keep Himalayas disabled if useful pilot measurement cannot comply.

Deletion covers the local database, inspection output, exports/snapshots and logs, not just active-list filtering. Normal logs must never contain descriptions or contact data. Purge due data on run startup and before inspection; after downtime, overdue content cannot reappear from a persisted Emulator snapshot. No real-data backup/archive is enabled until its purge behavior is established. Restricted retention takes precedence over idempotency/history and measurement convenience; any resulting repeat-count uncertainty is disclosed, not solved by retaining forbidden identifiers. Long-term retention beyond the proposed pilot policy requires a later owner decision.

### FR-07 — Source health and execution history

For each source show last attempt, last fully successful collection, last useful partial progress, consecutive operational failures, safe error class, next retry eligibility and suspension reason. Empty valid responses can be successful with zero yield. Item rejects, budget truncation and transport failure are distinguishable; partial results cannot masquerade as complete success.

Propose automatic suspension after **three consecutive operationally failed source runs**, with explicit owner re-enablement after the cause is addressed. Permission/access restrictions block immediately; a rate-limit wait prevents early retry. A valid budget-limited pass is bounded work, not automatically an outage. Partial valid progress does not erase an ongoing operational failure streak. Collection and status-check health are reported separately; expiry/deletion obligations continue even when collection is suspended.

Each execution has an ID, start/end, mode, effective source configuration/policy revision, result (`success`, `partial`, `failed`, `cancelled` or interrupted equivalent), stop reasons and counters. Include feed/status attempts, retries, bytes, records received, invalid, new, changed, unchanged, duplicate-linked, status outcomes and pending/deferred work. Distinguish committed results from fetched/attempted writes. An interrupted run stays distinguishable after restart; recovery never silently reports it as successful. One source's failure does not discard valid committed progress from another. Exit status and the local summary distinguish complete success from partial/failure.

### FR-08 — Local operation and inspection

Provide documented manual local entry points for configuration inspection, one ingestion pass, source health/history, vacancy list/detail and policy cleanup. Offline is the default; `live_sources` requires separate authorization and must remain independent of `live_integration`/AI. A local Emulator project does not imply synthetic content: pilot data must stay isolated from synthetic tests and seed/reset workflows.

A bounded, paginated CLI is sufficient. Show source attribution/link, original application destination, permitted readable text, description coverage, observed dates, source date semantics, availability/freshness, geography/language unknowns and duplicate links. Support filtering by source, observation period, availability and review state for measurement. Render source HTML as inert readable text; no scripts, remote images or automatic URL fetching. Public Web endpoints never expose pilot data. Review annotations are private local evidence, not screening or matching outcomes.

### FR-09 — Pilot measurement

Propose **14 consecutive days**, dates fixed at separate activation approval, with two seven-day reporting windows. Before activation, record enabled sources, filters, budgets, policy versions, retention and proposed success thresholds. Do not change filters invisibly; any change is dated and its effect on comparability reported.

The first collection pass establishes an **initial observed backlog**. Later first-seen unique groups are newly discovered during the pilot; classify them further as source-published during the pilot, pre-existing/late-discovered or publication-time unknown. A record published before pilot start is never claimed as newly published. Modifications, reposts known to be the same role, reopening and second-source copies do not add weekly novelty. A later copy of a backlog role remains backlog. Where deletion prevents exact historical comparison, disclose the limitation.

Proposed experimental targets, evaluated **in each seven-day window**, excluding backlog: at least **10 newly discovered unique manually plausible technical vacancies**, of which at least **three have explicit evidence of remote-work eligibility from Germany**. Also report newly published yield separately; “newly discovered” is not a claim of newly posted supply. These are hypotheses, not implementation guarantees or established market facts.

Manual plausibility means a technical role plausibly related to the vision's JS/TS, Node.js, backend/full-stack, applied AI or cloud development direction, with no clear source evidence making exploration pointless. It does not mean a candidate match, legal work entitlement or assumed language proficiency. Record yes/no/uncertain and a short private reason; unreviewed records do not count as plausible successes.

| Metric                    | Definition and reporting                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Employer segments         | German, Ukrainian and other evidenced employers, plus unknown/mixed classification when evidence is insufficient. Ukrainian includes evidenced Ukraine-founded or Ukraine-based employers, with the basis distinguished. Employer origin is not inferred from role location. Report counts per source and deduplicated overall; disclose overlaps.                                              |
| Germany remote evidence   | Count only manually confirmed source wording/structured restrictions explicitly supporting remote work from Germany, with field/quote and observation date. A query filter, employer address, “remote” alone or timezone overlap is insufficient. Europe/worldwide assertions require review for contradictory exclusions. Contractual/payroll eligibility remains separate and may be unknown. |
| Ukrainian abroad coverage | Report unique plausible technical roles from evidenced Ukrainian employers explicitly accepting candidates abroad, and the subset accepting Germany. Zero is a reported gap, not a first-pilot failure gate.                                                                                                                                                                                    |
| Duplicates                | Duplicate source records divided by valid observed source records, with denominator and within-source repeats separated; report automated links, manual confirmations and ambiguous candidates. Do not sum linked copies as opportunities.                                                                                                                                                      |
| Freshness                 | Age at first observation from a genuine publication date where available; separately update age, discovery delay, last observation and last availability confirmation. Unknown dates remain unknown; do not treat Himalayas update time as publication time.                                                                                                                                    |
| Source reliability        | Actual versus intended passes, collection/status failures by class, rejects, suspension, cap hits, truncation and deferred work. Missed manual passes are not source outages.                                                                                                                                                                                                                   |
| Description coverage      | Fractions full-as-supplied, excerpt-only and missing among valid unique roles and per-source records. Measure substantial text separately if useful; length alone does not prove completeness.                                                                                                                                                                                                  |
| Application destinations  | Aggregator, direct employer/ATS, unknown kind and missing/invalid, with counts/denominators. Application email and general contact coverage are separate and optional; no automated destination crawling.                                                                                                                                                                                       |
| Unknown requirements      | Geography, contractual eligibility and language requirements unknown/conflicting counts; no assumed candidate proficiency or automated rejection.                                                                                                                                                                                                                                               |
| Manual usefulness         | Reviewed/unreviewed/uncertain counts, opportunities the candidate would explore further, useful/reviewed fraction, review minutes and minutes per useful opportunity. Record backlog and weekly discovery separately. No application submission is needed.                                                                                                                                      |

An end-of-pilot report shows both weeks, each source's marginal unique yield, failures/limitations, review effort and a recommendation to continue, narrow, pause or investigate other sources. No extrapolation to market recall. The owner decides usefulness; no invented usefulness percentage or time-saving threshold is declared passed. Missing measurements or inaccessible records are explicit, not zero-filled successes.

## Non-functional requirements

- **Safety:** no source request before mode/configuration/policy validation; no external calls in offline tests or CI. Allowlisted HTTPS hosts, rejected unexpected redirects and no fetching URLs found in vacancy text. Identify JobScout generically without personal contact data.
- **Boundedness:** no run, response, pagination loop, retry or inspection query can be unbounded. Exact time/byte/status/storage limits must be fixed in the approved plan and shown before pilot activation; reaching a limit produces an observable outcome without silent data loss.
- **Reliability:** restart/replay preserves committed source identity, first observation and revision correctness. Local persistence survives a demonstrated clean restart; Emulator behavior is not proof of production reliability.
- **Privacy:** zero real vacancy/contact records in Git, CI fixtures, public pages or routine logs; private outputs follow their source deletion policy. No external AI or JobFlow transfer.
- **Inspectability:** a reader can distinguish unavailable, stale, unknown, duplicate and invalid records and reproduce every aggregate from permitted local evidence or identify why deleted evidence prevents reproduction.
- **Cost:** free public APIs and local resources only. No wallet, subscription, paid fallback or cloud provisioning.

## Acceptance criteria

Origins: **O** = this owner direction; **M0-n** = proposed criterion n in the accepted investigation; **R** = existing repository/skill constraint. **Added** identifies proposals needed to make operation/measurement observable; revision 1 and its marked additions are approved subject to the owner approval record above. Implementation and pilot activation remain separate gates.

| ID    | Observable outcome                                                                                                                                                                                                                                       | Origin                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| M2-01 | Effective source settings and dated permission records are inspectable; disabled, unresolved or unsupported sources make zero requests. Jobicy is first; Himalayas has its own gate.                                                                     | O, M0-5, R                                                                   |
| M2-02 | A permitted Jobicy fixture pass preserves source identity, text, attribution and supplied destination; repeats are idempotent. Live activation is a separate decision.                                                                                   | O, M0-4                                                                      |
| M2-03 | Himalayas fixtures prove supplied Apply destination, expiry/status behavior and deletion; live use remains disabled until relevant retention/processing permissions and affordable status coverage are established.                                      | O, M0-5                                                                      |
| M2-04 | Per-source 100-record/two-page bounds, sequential requests, one-retry ceiling, total and separate feed/status accounting stop safely under repeated cursors, oversized responses and timeouts. Exact remaining budgets are documented before activation. | O, M0-4; Added two-page/retry envelope from M0 recommendation                |
| M2-05 | Mixed valid/invalid items retain valid siblings; normalized unknowns stay unknown, dates keep source meanings, optional missing text/links remain inspectable limitations.                                                                               | O, M0-3/4, R                                                                 |
| M2-06 | Repeat, cosmetic change, significant edit and interrupted replay produce correct first-seen, committed counts and revisions; an overlapping run cannot corrupt newer state.                                                                              | O, M0-4; Added concurrency/recovery observability from engineering standards |
| M2-07 | Synthetic cross-source reposts link while distinct similar roles remain separate; both sources/destinations survive and weekly yield counts the group once.                                                                                              | O, M0-4, R                                                                   |
| M2-08 | Rolling-feed absence, partial/failed/empty fetches and 404/unknown never create a confirmed closure. Explicit closure/expiry hides content; reopening does not create novelty.                                                                           | O, M0-3/4, R                                                                 |
| M2-09 | Policy cleanup removes prohibited content/derivatives from persistence and outputs; restart/inspection cannot resurrect overdue records. Jobicy end-plus-seven-day retention and conditional Himalayas deletion are testable.                            | O, M0-5; Added minimization proposal                                         |
| M2-10 | Source health and run history distinguish empty success, capped work, rejects, partial writes, failure and interruption. Three failed runs suspend collection; access/permission failures block immediately. Recovery is explicit.                       | O, R; Added three-run threshold                                              |
| M2-11 | Offline local commands make zero external calls; authorized local live-source mode uses only verified local persistence. CLI inspection exposes the FR-08 evidence safely without requiring a Web feature.                                               | O, R; Added CLI scope choice                                                 |
| M2-12 | Synthetic measurement evidence separates initial backlog, late discovery, new publication, edits and second-source copies; segments and all FR-09 quality/usefulness metrics have denominators and unknowns.                                             | O, M0-1/2/3/6                                                                |
| M2-13 | A pilot readiness record includes approved thresholds, budgets, dates, retention, permissions and persistence evidence; pilot cannot start through PRD approval alone.                                                                                   | O, M0-5/6                                                                    |
| M2-P1 | After separate authorization, report 14 days and both weekly windows against the proposed 10/three targets, Ukrainian coverage separately, actual review usefulness and limitations. A failed target is an experimental finding, not a fabricated pass.  | O, M0-1/2/3/6                                                                |

M2-01–13 are implementation/readiness criteria; M2-P1 is later experimental acceptance. Passing offline tests proves neither weekly yield nor actual source availability. Jobicy-only completion is valid if the conditional Himalayas gate stays closed and its exclusion is documented.

## Test requirement sketch

Use deterministic offline source fixtures with injected HTTP, clocks and persistence. Verify caps across filter combinations/retries, cursor repetition/expiry, per-item rejection, timestamp meanings, nullable facts, changed content, duplicate false positives, explicit closure and unknown status. Include `syn-001`/`syn-002` repost variation without committing real samples.

Emulator integration must prove idempotent writes, recovery after partial commits, overlap protection, correct run accounting and policy deletion including prior versions/derived evidence. Test expired-data behavior across restart and source suspension. Synthetic metric cases must show a backlog duplicate discovered in week two does not increase new yield, update-only timestamps do not count as publication, and unknown employer origin stays unknown.

Security evidence covers redirects/host abuse, oversized bodies, unexpected content types, malicious HTML/URLs, inert display and logs without content/contact leakage. Repository implementation checks follow [development](development.md) and `implementation-verification`, including `pnpm check`, app/package builds and affected Emulator/container checks. Real-source smoke tests and the pilot need separate live authorization; they never run in CI. Manual owner checks cover plausibility, Germany evidence and actual usefulness, separately from automated checks.

## Edge cases and failure scenarios

| Scenario                                                                                      | Required visible outcome                                                                                                                              |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty valid feed, changed filters or a full page at the cap                                   | Zero/limited yield with exact configuration and stop reason; no closure or completeness claim.                                                        |
| Cursor invalid/expired, repeated page or inconsistent envelope                                | Stop/defer or bounded restart within the same budget; never loop or silently reset novelty.                                                           |
| HTTP 429, long `Retry-After`, timeout, 5xx or non-JSON response                               | Safe error class, bounded eligible retry or deferred work; no premature retry, whole-run success or paid fallback.                                    |
| Access denied, permissions withdrawn or unresolved changed terms                              | Block affected source immediately; apply required deletion, preserving only allowed evidence.                                                         |
| Invalid ID, bad optional URL, oversized description or malformed sibling                      | Reject invalid identity/unsafe oversize item with reason; preserve valid siblings and truthful optional-field limitations. No raw quarantine dataset. |
| Missing language/geography, timezone-only match or contradictory country prose                | Preserve unknown/conflict; manual review cannot turn a filter hit into eligibility evidence.                                                          |
| Same company/title but different role; repost with changed whitespace                         | Avoid false merge, link only supported duplicates and preserve both application origins.                                                              |
| Persistence failure after some writes, forced exit or overlapping invocation                  | Keep valid committed records, mark incomplete execution and recover idempotently without inflating metrics.                                           |
| Source vanishes from rolling feed, returns unknown or later reopens                           | Preserve evidence-based availability; do not infer closure/new vacancy from feed membership.                                                          |
| Himalayas check budget exhausted, expired while app is stopped, or duplicate evidence deleted | Hide unconfirmed/expired content, purge before inspection, disclose metric uncertainty; never retain restricted content to improve counts.            |
| Emulator reset/restart, missed manual passes or changed pilot filters                         | Detect/report continuity gaps; do not interpret data loss or missed operator work as source failure or successful 14-day evidence.                    |
| Low yield, no Ukrainian vacancies or mostly irrelevant records                                | Report the experiment honestly. Ukrainian zero is not a blocking first-pilot criterion; poor overall usefulness needs an owner decision.              |

## Open questions

Owner direction already resolves: accept M0; use Jobicy first; accept aggregator destinations; remain private with a public code repository; no mandatory Ukrainian yield, language assumption, JobFlow or AI processing. Other researched sources stay excluded.

| Decision                                    | Owner disposition                                                                                                                                                                                                                                                                                                           | Boundary                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Final pilot yield interpretation/thresholds | Resolved by product owner for revision 1: accept 10 new unique plausible roles and three Germany-remote-evidenced roles in each week, excluding backlog; newly published subset is reported separately.                                                                                                                     | Approved 2026-11-27.                                                        |
| Useful enough to continue                   | Manual review, would-explore counts and review time accepted. Product owner explicitly defers any mandatory numerical usefulness threshold until pilot activation. No threshold is assumed.                                                                                                                                 | Deferred to pilot activation.                                               |
| Retention and conditional Himalayas scope   | Jobicy deletion by pilot end + seven days approved. Himalayas remains conditional on verified source-specific permissions, retention, deletion and status-check requirements. Jobicy-only readiness is acceptable; Himalayas must not delay it. Provider clarification, if needed, requires separately authorized outreach. | Policy approved 2026-11-27; Himalayas source readiness remains conditional. |
| Pilot launch                                | Product owner: authorize dates, source set and concrete request/status/time/byte/storage budgets after implementation readiness.                                                                                                                                                                                            | Separate 14-day authorization; no launch now.                               |

Exact normalization schema, comparison thresholds, failure exit codes, collections/indexes, CLI syntax and finite byte/time/status limits are planning decisions within these constraints, not additional product forks. If planning reveals that compliance needs a materially different scope, return for owner review.

The owner has approved **revision 1** and resolved or explicitly deferred the decisions above. Planning is authorized in principle within this scope but remains on hold until the separate engineering workflow improvement task is completed. No technical plan, Issues, adapter implementation or live pilot starts in this task.

## Documentation to update

- [Roadmap](roadmap.md): record accepted M0, approved M2 PRD revision 1 and the planning hold without marking implementation or activation approved.
- [M0 report](m0-data-source-feasibility.md): append the dated owner disposition while preserving original measurements and conclusions.
- During implementation: [architecture](architecture.md), [local development](local-development.md) and README for actual commands, data isolation, persistence, limits and inspection; source-policy references and retention/deletion instructions alongside source configuration.
- During pilot readiness/completion: private activation/measurement records; only permitted non-identifying aggregates and synthetic examples may be added to the public repository. Update ADRs only if an accepted architectural choice actually changes.

## Proposed subtask breakdown (epic only)

Candidate implementation phases in dependency order; these are independently verifiable product slices, not a technical plan or Issue drafts. No integration branch is needed at PRD drafting time.

| Phase                                              | Dependency                                           | Reviewable outcome and exit evidence                                                                                                                                            | Criteria                                |
| -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1. Local contracts and source policy               | Approved PRD, then approved plan                     | Synthetic normalized records, source settings and denied-operation examples; no live source.                                                                                    | M2-01, M2-05, M2-11                     |
| 2. Jobicy ingestion and persistence                | Phase 1                                              | Offline end-to-end pass/replay, significant modifications, bounded failure recovery and run/health inspection in Emulator.                                                      | M2-02, M2-04, M2-06, M2-10              |
| 3. Availability, retention and duplicate integrity | Phase 2                                              | Offline status/expiry/unknown/deletion cases, restart continuity and synthetic cross-source deduplication without another live source.                                          | M2-07, M2-08, M2-09                     |
| 4. Local inspection and pilot readiness            | Phases 1–3                                           | Safe CLI and synthetic backlog/weekly/segment/usefulness report; finite full-run budgets, restart/privacy evidence and activation checklist. Jobicy-only readiness is possible. | M2-11, M2-12, M2-13                     |
| 5. Conditional Himalayas extension                 | Phases 1–4 and its relevant permission/deletion gate | Source-specific offline behavior and status-capacity proof; stays disabled if unresolved. It must not delay the Jobicy pilot.                                                   | M2-03, M2-04, M2-07–M2-10, M2-12, M2-13 |
| 6. Separately authorized local observation         | Ready implementation and explicit 14-day approval    | Actual two-week report, manual evidence, residual gaps and owner continuation decision.                                                                                         | M2-P1                                   |

Owner approval of revision 1 is recorded above. Stop after recording it; the planning hold remains in effect. The breakdown does not authorize any phase.

## PRD drafting verification

Historical evidence from drafting revision 1, before owner approval. The pending approval and handoff statements in this subsection are superseded by the owner approval record above; they are preserved for traceability.

- **Scope:** owner-authorized M2 PRD and documentation synchronization only.
- **Revision:** draft revision 1, working documentation changes; no commit or PR created.

### Acceptance criteria

- **Satisfied:** complete M0 report, required project documents, all accepted ADRs and affected code reviewed; scope evaluated against existing package boundaries.
- **Satisfied:** current official Jobicy/Himalayas documentation and terms reviewed with dated references; unresolved relevant permissions remain activation gates.
- **Satisfied:** all canonical PRD sections, observable criteria, edge/failure cases, exclusions, dependencies, actual variation points and candidate phases included. Added proposals identify their origins.
- **Satisfied:** backlog/novelty distinctions, proposed weekly targets, employer segments, manual usefulness and separate 14-day authorization are explicit.
- **Satisfied:** no adapters, Issues, detailed technical plan, live vacancy collection, AI calls or cloud changes performed.
- **Pending:** owner approval of the named PRD revision and its material policy/metric decisions. Implementation and experimental criteria above are requirements, not claimed completed features.

### Checks

| Command or check                                    | Result         | Evidence or limitation                                                                                              |
| --------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                        | Passed         | Formatting, lint, architecture, skills, typecheck and 12 unit-test files / 47 tests.                                |
| Canonical PRD headings                              | Passed         | Every level-two heading from the template is present.                                                               |
| Local Markdown links                                | Passed         | Links in all three affected documents resolve.                                                                      |
| `git diff --check` and document secret/contact scan | Passed         | No whitespace errors or matches for tested key/private-key/email patterns; content also reviewed for real datasets. |
| `pnpm build`                                        | Not applicable | No app/package changes.                                                                                             |
| Emulator, container and Terraform checks            | Not applicable | No runtime, persistence implementation, container or infrastructure changes.                                        |
| Remote CI and live-source tests                     | Not run        | Documentation-only task; no PR or source activation.                                                                |

Checks used installed Node 24.15.0 through a process-local PATH and Corepack/pnpm 12.23.0, without changing toolchain files. Node satisfies the engine range but differs from pinned `.node-version` 24.22.3, which is not installed. The final documentation-only verification appendix receives a targeted formatting check after these recorded checks.

### Diff review

Only this PRD, the dated M0 owner disposition and roadmap synchronization are in scope. The roadmap modification and untracked M0 report already existed at task start; their research content is preserved. No dependencies, architecture decisions, secrets, collected records or generated datasets are added. The remaining risks are conditional source rights/retention and unmeasured longitudinal usefulness.

### Owner verification and handoff

Review revision 1's Open questions and marked added proposals. Approval authorizes the next technical-planning step within that scope; this task stops here. Live pilot dates, final budgets, permissions and actual usefulness remain separately reviewable.
