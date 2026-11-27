---
name: typescript-engineering
description: Strict TypeScript engineering rules for the JobScout pnpm monorepo. Use when writing or reviewing any .ts/.tsx code in apps/ or packages/, adding a workspace package or dependency, changing tsconfig, package exports or vitest.config.ts, or writing Vitest unit and integration tests.
---

# TypeScript engineering (JobScout monorepo)

## When to use

- Any change to `.ts`/`.tsx` files under `apps/*` or `packages/*`.
- Adding a workspace package, a dependency, a tsconfig or a Vitest project.
- Designing error handling, boundaries or tests. Next.js specifics → `nextjs-fullstack`;
  UI → `frontend-ui-ux`; ADK → `google-adk`; Firestore → `firestore`.

## Compiler contract (`tsconfig.base.json`)

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `useUnknownInCatchVariables`, `noImplicitOverride`, `noImplicitReturns`. Do not relax them
  per package. No `any`, no `@ts-ignore`/`@ts-expect-error`, no `as` casts that hide a real
  type problem; narrow with Zod or type guards instead (see `isMode` in
  `apps/web/src/components/color-scheme-toggle.tsx`).
- `erasableSyntaxOnly`: no `enum`, `namespace`, or constructor parameter properties. Use
  `as const` tuples + `z.enum` (see `SCREENING_OUTCOMES` in `packages/core/src/screening.ts`)
  and explicit `readonly` fields assigned in the constructor.
- `verbatimModuleSyntax`: type-only imports use `import type` / inline `type` (ESLint enforces
  `consistent-type-imports`).
- Node packages (`module: NodeNext`): relative imports carry the `.ts` extension
  (`./screening.ts`); `rewriteRelativeImportExtensions` rewrites them to `.js` on build.
  `apps/web` uses `moduleResolution: Bundler` and the `@/` alias instead.
- With `exactOptionalPropertyTypes`, never assign `undefined` to an optional property; omit it.

## Workspace packages and the `@job-scout/source` condition

Each package exports `src/index.ts` under the custom condition `@job-scout/source` and
`dist/` otherwise. Typecheck (`customConditions` in the base tsconfig), Node scripts
(`node --conditions=@job-scout/source ...`) and Vitest (aliases in `vitest.config.ts`) read
sources directly; `tsconfig.build.json` clears `customConditions` and emits `dist/`.

Adding a package `packages/<name>`:

1. `package.json`: `"name": "@job-scout/<name>"`, `"type": "module"`, `exports` with the three
   conditions (copy `packages/core/package.json`), `files: ["dist"]`, scripts `build`, `dev`,
   `typecheck`, `clean`.
2. `tsconfig.json` (extends base, `include: ["src"]`) and `tsconfig.build.json` (copy
   `packages/core/tsconfig.build.json`; excludes `*.test.ts`).
3. Add the name to `workspacePackages` in `vitest.config.ts`.
4. Respect dependency direction: `packages/core` imports no workspace package, framework, ADK or
   Firestore. Update the Dockerfiles' `COPY` lines if an app depends on it.
5. New frameworks, databases or major packages need an ADR in `docs/decisions/`.

## Design rules

See [engineering standards](../../../docs/engineering-standards.md). Use the focused JavaScript metaskills for collection semantics, error recovery or genuine design variation. Keep package boundaries verifiable with `pnpm lint:architecture`.

- Zod at every boundary (env, HTTP, source payloads, model output, fixtures); derive types with
  `z.infer`. Parse once at the edge, pass typed values inward.
- Business rules live in `packages/core`, framework-free. Apps are thin adapters.
- Expected failures are values: discriminated unions such as `ScreeningRunResult`
  (`{ ok: true, result } | { ok: false, kind, message }`). Throw only for programmer errors,
  invalid configuration (`RuntimeConfigError`) or failures a caller must route (provider errors).
- Inject clocks, `fetch`, env and I/O as parameters (`createServiceHealth(service, now)`,
  `runWorker({ env, logger, checkDatabase })`, `resetEmulatorDatabase(config, fetchFn)`).
- No premature abstraction: no generic repositories, base classes, DI containers or empty
  modules. Extract a helper on the second real use.
- `catch (error: unknown)` and format with `error instanceof Error ? error.message : String(error)`.

## Tests (Vitest)

- Unit: `{apps,packages}/*/src/**/*.test.{ts,tsx}` and `scripts/**/*.test.ts` (project `unit`). Integration:
  `*.integration.test.ts` (project `integration`, Firestore Emulator, serial).
- Deterministic: no network, no real AI, no wall clock (inject `Date`), no randomness without a
  seed. Use fakes (`fakeFetch` in `packages/firestore/src/emulator.test.ts`, `ScriptedLlm`).
- Test behavior and contracts (schema accept/reject, fail-closed paths), not implementation.
- Follow the [independent test workflow](../../../docs/development.md). Target approved public
  contracts, distinguish missing exports from behavioral RED and keep supplementary tests
  discoverable in separate files alongside the frozen baseline.

## Dependencies

- Add only what is used now; prefer the platform (`fetch`, `node:crypto`, `AbortSignal.timeout`).
- Lifecycle scripts are denied by default; any new entry in `allowBuilds`
  (`pnpm-workspace.yaml`) needs a reviewed script and a reason. Review `pnpm-lock.yaml` diffs.
- Never add Claude/Anthropic tooling.

## Verification

```sh
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test   # = pnpm check
pnpm build                                                     # when packages/apps change
```

Finish with `implementation-verification`.

## References

- https://www.typescriptlang.org/tsconfig
- https://zod.dev
- https://vitest.dev/guide/projects
- https://pnpm.io/settings
