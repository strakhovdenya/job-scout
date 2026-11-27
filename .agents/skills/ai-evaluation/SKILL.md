---
name: ai-evaluation
description: Evaluation of JobScout AI screening quality using synthetic labelled vacancies. Use when changing the screening instruction, output schema, model or provider configuration, when adding evaluation cases to fixtures/synthetic-vacancies.json, comparing models, measuring token usage, or defining regression gates for packages/agent.
---

# AI screening evaluation

Status: the dataset and offline doubles exist; an evaluation runner is **planned**
(`planned: pnpm eval` — the script does not exist; do not reference it as runnable and do not
add it unless the task asks).

## When to use

Any change that can alter screening output: instruction text, `screeningResultSchema`,
`enforceGroundedSkip`, model ID, provider routing, input encoding.

## Dataset

- Source: `fixtures/synthetic-vacancies.json`, validated by `syntheticVacancyDatasetSchema`.
  Labels per case: `expected.outcome`, `expected.remoteFromGermany`,
  `expected.statedLanguages` (`language`, `requirement`), `expected.notes`.
- Labels assume no configured candidate profile.
- Add cases for every bug or new rule: ambiguous remote ("Remote" without countries →
  `unknown`), languages not stated, general contact vs application email, prompt injection in
  the description, duplicates, UA/DE employers, German-language postings.
- Synthetic only: invented companies, `.example` domains, no real people, recruiters or
  listings. Keep the `synthetic-vacancy.test.ts` invariants passing.

## Metrics

1. **False-negative rate (primary)**: cases labelled `worth_exploring` or `maybe` that the
   system returns as `skip`. Hiding a good vacancy is the costliest error; gate on it.
2. Outcome accuracy / confusion matrix over the three outcomes.
3. Grounding: every `skip` evidence quote found in the source (`findUngroundedEvidence` must
   return `[]`); rate of skips downgraded by `enforceGroundedSkip`.
4. `remoteFromGermany` accuracy; stated-language precision/recall (language + requirement).
5. Schema validity rate (`parseScreeningResponse` ok vs `invalid_json`/`schema_violation`),
   timeouts, `no_response`.
6. Cost: input/output tokens and requests per vacancy (from provider usage metadata).

## Workflow

1. Write expected labels before running the model; do not tune labels to outputs.
2. Offline first: run the pipeline with `BaseLlm` doubles (see `ScriptedLlm` in
   `packages/agent/src/screening-agent.test.ts`) to test parsing, grounding and metric code
   deterministically in `pnpm test`.
3. Live evaluation only with explicit user approval, in `live_integration` mode with
   `JOBSCOUT_AI_MAX_REQUESTS_PER_RUN` / `JOBSCOUT_AI_MAX_TOKENS_PER_RUN` set, sized to the
   dataset. Check current quotas first (`free-tier-governance`).
4. Record each run: model ID (from config), provider, date, prompt/instruction version or
   hash, dataset version, metrics, token totals. Store reports outside committed secrets;
   never commit API keys or raw provider responses containing personal data.
5. Model comparison: same dataset, same prompt version, report per-metric deltas and
   false-negative cases individually.
6. Regression gate (proposal until implemented): no increase in false negatives, no ungrounded
   skips, schema validity not lower than the previous accepted run.

## Verification

```sh
pnpm test                 # dataset schema + offline doubles
pnpm lint && pnpm typecheck
```

State explicitly whether any live evaluation ran, with which model ID and budget.

## References

- https://adk.dev
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/tokens
