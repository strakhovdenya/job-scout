---
name: nextjs-fullstack
description: Next.js 16 App Router server-side work in apps/web for JobScout. Use when adding or changing pages, layouts, Route Handlers under apps/web/src/app, server-only modules in apps/web/src/server, instrumentation.ts, caching or dynamic rendering, environment variables, next.config.ts, or the web Dockerfile and standalone output.
---

# Next.js full-stack (apps/web)

## When to use

Routing, rendering, data fetching, Route Handlers, server modules, env/config and build
output of `apps/web`. Visual design, MUI and accessibility → `frontend-ui-ux`. Shared logic
belongs in `packages/core` (see `typescript-engineering`).

## Current structure

- `src/app/layout.tsx`, `src/app/page.tsx` — Server Components (no `'use client'`).
- `src/app/api/health/route.ts` — Route Handler: `export const dynamic = 'force-dynamic'`,
  `Cache-Control: no-store`, liveness only (no DB, credentials, AI or external calls).
- `src/server/*` — server-only services. Modules touching env or secrets start with
  `import 'server-only'` (see `src/server/runtime-config.ts`).
- `src/instrumentation.ts` — `register()` validates config via `loadRuntimeConfig` on Node.js
  server start (skipped during the production build phase) and exits on invalid config.
- `src/components/*` — Client Components (`'use client'`) only where interactivity is needed.
- `next.config.ts` — `output: 'standalone'`, `outputFileTracingRoot` and `turbopack.root` at the
  monorepo root, `poweredByHeader: false`.

Use the installed Next.js documentation at `apps/web/node_modules/next/dist/docs` for version-matched guidance. Agent files are repository-owned; `agentRules: false` keeps dev startup from generating them.

## Workflow

1. Check [roadmap](../../../docs/roadmap.md) — do not build planned features unasked.
2. Default to Server Components. Add `'use client'` at the smallest leaf that needs state,
   effects, browser APIs or event handlers. Never import `src/server/*` from client code.
3. Route Handlers: parse request input with Zod (`safeParse`, return 400 with a safe message),
   return `Response.json(...)`, set caching explicitly. Keep handlers thin; delegate to
   `src/server/*` and `@job-scout/core`.
4. Data that is per-user or changes often: dynamic rendering, `no-store`. Do not cache
   anything user-specific. Verify current caching APIs in the official docs before using them;
   Next.js caching semantics changed across major versions.
5. Add route segment conventions where they help: `loading.tsx`, `error.tsx` (must be a Client
   Component), `not-found.tsx`. Error UIs must not leak stack traces or config.
6. Config: read env only on the server, after validation. `config/local.env` and the optional
   root `.env` are loaded by the `dev` script (`node --env-file=...`); production gets env from
   Cloud Run. Never introduce `NEXT_PUBLIC_*` for secrets, API keys, model IDs or project IDs.
7. Authentication: Auth.js with Google OAuth is **planned, not installed**. Do not add it
   without the task asking. Design new server code so an auth check can be inserted at the
   Route Handler / server action boundary; never trust client-supplied user IDs.
   `JOBSCOUT_MOCK_AUTH` is local-only and rejected in production.
8. Server Actions/Route Handlers that mutate state need authz (once auth exists), input
   validation and idempotency.

## Build and container

- `next build` produces `.next/standalone` mirroring the monorepo layout; the Dockerfile runs
  `node apps/web/server.js` on `PORT=8080` as `node`. When the web app gains a workspace
  dependency, add its `COPY` lines to `apps/web/Dockerfile`.
- Production refuses to start with emulator settings, mock auth or offline mode (see the CI
  smoke test in `.github/workflows/ci.yml`).

## Verification

```sh
pnpm typecheck            # runs `next typegen` for apps/web
pnpm lint && pnpm test
pnpm build
pnpm dev:web              # then: curl -fsS http://localhost:3000/api/health
docker build -f apps/web/Dockerfile -t job-scout-web .   # when Dockerfile/output changes
```

Open changed pages in a browser (light and dark) and check the server console for errors.
Finish with `implementation-verification`.

## References

- https://nextjs.org/docs
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://nextjs.org/docs/app/api-reference/file-conventions/route
- https://nextjs.org/docs/app/guides/instrumentation
- https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- https://authjs.dev
