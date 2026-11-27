# Technical plan: <feature>

- **Approved PRD:** <link and revision>
- **Status:** Draft | Approved (owner and revision)
- **Date:** <date>

## Existing architecture and affected modules

Cite current code, tests and ADRs. Trace dependencies and identify contract owners and stable variation boundaries.

## Contracts, data and state

Describe schemas and compatibility, persistence and indexes, state transitions, API and UI flows, and rollout where relevant.

## Reliability, security and resource use

Explain validation, error behavior, concurrency, cancellation, idempotency, IAM, rate limits, budget controls, infrastructure and data protection. State risks and recovery paths with owners.

## Implementation phases

### Phase 1: <name>

- **Goal and affects:** <deliverable and files/modules>
- **Dependencies:** <prerequisite and status>
- **Tasks:** <ordered independently testable steps>
- **Tests and documentation:** <public contracts and observable scenarios for independent tests, expected evidence and changed references>
- **Done when:** <literal PRD criterion or stable ID plus observable evidence>

Repeat per phase. Use vertical slices when they can exercise the full path. Explain any integration branch recommendation.

## Traceability and unresolved decisions

Map every PRD criterion to a phase, task and evidence type. Record the alternatives behind disputed decisions and identify which require ADRs or owner review.
