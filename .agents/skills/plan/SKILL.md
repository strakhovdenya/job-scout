---
name: plan
description: Produce a JobScout technical plan and implementation phases from an approved PRD.
---

# Plan

Read the approved PRD revision, architecture, relevant ADRs, actual entry points and tests. Sketch dependency and data flow before proposing a new abstraction. Compare how alternatives affect contracts, error boundaries, security, reliability, cost and rollout. Identify open ADRs and dependencies.

Use the [technical plan template](../../../docs/templates/technical-plan.md). Give each phase a demonstrable result, named modules, ordered tasks, prerequisites, tests and PRD criteria. Prefer small vertical slices. Put unavoidable foundational work before dependents and define its independent evidence. Flag open high-impact decisions for the owner instead of passing them to an issue executor. Check mapping in both directions between PRD criteria and tasks. Seek explicit owner approval of the plan revision before decomposing and filing issues.
