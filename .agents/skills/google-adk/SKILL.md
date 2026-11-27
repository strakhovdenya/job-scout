---
name: google-adk
description: Google Agent Development Kit for TypeScript (@google/adk) in packages/agent. Use when creating or changing LlmAgent definitions, instructions, output schemas, tools, runners, events, custom BaseLlm model classes or test doubles, the screening agent in packages/agent/src/screening-agent.ts, or when evaluating ADK devtools.
---

# Google ADK (TypeScript) in packages/agent

## When to use

Changes in `packages/agent` or any code that constructs ADK agents, runners, tools or models.
Provider choice/fallback → `llm-provider-routing`. Quality measurement → `ai-evaluation`.

## Ground rules

- ADK TypeScript (`@google/adk` 2.5.x) is **not** at parity with Python ADK. Never port a
  Python example (e.g. `LiteLlm`, Python callbacks) assuming it exists. Verify every class,
  option and signature in `node_modules/@google/adk/dist/types/**` before using it.
- ADK docs list Node 24.13+; the repo pins Node in `.node-version`.
- `packages/agent` contains no UI/framework code; domain contracts come from `@job-scout/core`.
- Model IDs come from config (`loadScreeningModelConfig` → `JOBSCOUT_SCREENING_MODEL`), never
  literals in code or tests.

## Verified API surface (2.5)

- `new LlmAgent({ name, description, model: string | BaseLlm, instruction, outputSchema,
outputKey, tools, generateContentConfig, includeContents })`. `outputSchema` accepts a Zod v4
  `ZodObject` or a genai `Schema`; it sets `responseSchema` + `application/json`.
- ADK only **logs** output-schema validation failures. Always re-validate the final text with
  Zod — here `parseScreeningResponse` (JSON parse → `screeningResultSchema` →
  `enforceGroundedSkip`).
- If an agent has `tools` and the model is not Vertex Gemini 2+, ADK injects a
  `set_model_response` tool to return structured output. Account for it in tests and prompts.
- `new FunctionTool({ name, description, parameters: zodSchema, execute })`.
- `InMemoryRunner` / `Runner.runAsync({ userId, sessionId, newMessage, abortSignal })` returns
  `AsyncGenerator<Event>`; pick the answer with `isFinalResponse(event)`. Always
  `await runner.close()` in `finally`.
- Custom models: subclass `BaseLlm`, implement `async *generateContentAsync(request)` and
  `connect()`. `LLMRegistry` resolves string model names to classes.
- `RoutedLlm({ models, router })` exists (graduated from experimental); see
  `llm-provider-routing` before using it.
- There is no LiteLLM/OpenAI model class in TS. Groq or Cloudflare Workers AI require a custom
  `BaseLlm` subclass for an OpenAI-compatible endpoint (planned, not implemented).

## Workflow

1. Read `screening-agent.ts` and its test. Keep the pattern: `createScreeningAgent` (pure
   construction), `buildScreeningMessage` (input encoding), `screenVacancy` (bounded run),
   `parseScreeningResponse` (validation) returning the `ScreeningRunResult` union.
2. Prompt-injection resistance:
   - the full user message is one JSON object. Fields are untrusted. Serialization does not prevent injection; the instruction forbids following embedded directions;
   - no tools that act on vacancy content (no fetching URLs, sending email, writing data);
     tools, if any, are read-only and side-effect free;
   - `includeContents: 'none'` for single-shot screening; bounded time via
     `AbortSignal.timeout` (map abort to `kind: 'timeout'`).
3. Typed failures (`invalid_json`, `schema_violation`, `no_response`, `timeout`) are results;
   provider errors (429, 5xx) propagate as exceptions for the router. A valid `skip` is never
   an error.
4. Tests use a `BaseLlm` double (`ScriptedLlm` in `screening-agent.test.ts`): canned replies,
   recorded `LlmRequest`s, `connect()` rejects. Assert that attempted instructions stay in data fields and on
   validated outcomes. No network, no real model, no API keys.
5. Run deterministic model-double regressions. Full prompt evaluation and semantic grounding are planned in M3 (see `ai-evaluation`). A quote match verifies textual presence only.

## ADK devtools (not installed)

`@google/adk-devtools` (`adk web`, `adk run`) was evaluated and rejected for now: it pulls five
MikroORM database drivers, express and esbuild. To re-evaluate: inspect its current
dependency tree and lifecycle scripts, try it in a throwaway branch wired to an offline
`BaseLlm` double so no quota is used, and record the decision in an ADR in `docs/decisions/`
before adding it.

## Verification

```sh
pnpm typecheck && pnpm lint
pnpm exec vitest run --project unit packages/agent   # focused run
pnpm test && pnpm build
```

Live model calls only in `live_integration` mode, on explicit user request, with budgets.

## References

- https://adk.dev
- https://github.com/google/adk-js
