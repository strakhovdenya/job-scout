---
name: vercel-react-best-practices
description: Review React and Next.js performance in JobScout, including request waterfalls, server rendering, bundle boundaries and unnecessary re-renders.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# React and Next.js performance

Selected Vercel Engineering rules for the JobScout stack. The examples describe
performance choices independent of hosting. Follow `nextjs-fullstack` for server
boundaries and caching policy, and `frontend-ui-ux` for accessibility and interaction.
Respect workspace package exports, tenant isolation, and provider request budgets.

- **Avoid waterfalls:** [parallel operations](references/async-parallel.md),
  [API routes](references/async-api-routes.md), [Suspense](references/async-suspense-boundaries.md),
  [server fetching](references/server-parallel-fetching.md).
- **Bundle boundaries:** [analyzable paths](references/bundle-analyzable-paths.md),
  [dynamic imports](references/bundle-dynamic-imports.md).
- **Server isolation and payload:** [per-request React cache](references/server-cache-react.md),
  [no shared request state](references/server-no-shared-module-state.md),
  [serialization](references/server-serialization.md).
- **Interactive rendering:** [derived state](references/rerender-derived-state-no-effect.md),
  [event logic](references/rerender-move-effect-to-event.md),
  [transitions](references/rerender-transitions.md),
  [content visibility](references/rendering-content-visibility.md).

Apply only rules that fit the actual runtime and observed bottleneck. Use independent
operations in parallel within established concurrency limits. Test correctness and compare
latency, rendering or bundle evidence when performance drives a change.
