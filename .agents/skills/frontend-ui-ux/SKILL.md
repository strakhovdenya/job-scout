---
name: frontend-ui-ux
description: React 19 and Material UI v9 interface work for the JobScout web app. Use when building or changing visual components, layouts, the theme in apps/web/src/theme.ts, forms, vacancy review and inbox interactions, accessibility, responsive behavior, or loading, empty and error states in apps/web.
---

# Frontend UI/UX (React 19 + MUI v9)

## When to use

Any visible change in `apps/web/src`: components, pages' markup, theme, interactions.
Routing, data loading and server boundaries → `nextjs-fullstack`.

## Stack facts

- MUI v9 with Emotion. `layout.tsx` wraps the app in `AppRouterCacheProvider`
  (`@mui/material-nextjs/v16-appRouter`) and renders `InitColorSchemeScript attribute="class"`
  to avoid a color-scheme flash. `<html suppressHydrationWarning>` is intentional.
- Theme: `apps/web/src/theme.ts` — `cssVariables` with `colorSchemeSelector: 'class'`,
  `light`/`dark` `colorSchemes`, system font stack, shared `shape`. `AppThemeProvider` uses
  `defaultMode="system"`; `ColorSchemeToggle` switches system/light/dark.
- No Tailwind, CSS frameworks, other component libraries or icon packs without an ADR. Style
  with `sx`, theme tokens and MUI components; no hardcoded colors outside `theme.ts`.
- Import MUI components by path (`@mui/material/Button`) as the existing code does.

## Product rules for the UI

- Screening shows exactly three outcomes: worth exploring, maybe, skip. No percentage match
  scores, confidence meters, rankings by "fit %", or hiring-probability language.
- Show evidence quotes and `unknown` states honestly ("Remote from Germany: not stated").
  "No languages stated" must not read as "no language required".
- Vacancy text is untrusted: render as text. Never `dangerouslySetInnerHTML` unsanitized HTML
  (see `security-review`).
- Application email vs general contact email are different fields; never relabel one.
- No nonfunctional buttons or placeholder links. Planned features are labelled as planned or
  omitted.
- Rapid review interactions (keyboard shortcuts, save/dismiss, next/previous) follow
  [UI plan](../../../docs/ui-ux.md). Use `material-ui-styling` for theme and slot mechanics.

## Workflow

1. Read `docs/ui-ux.md` and the existing components. Reuse theme tokens and patterns.
2. Keep Server Components by default; isolate interactivity in small `'use client'` components.
3. Design all states: loading (`loading.tsx` or skeletons with stable size), empty (explain why
   and what happens next), partial (some sources failed — say which), error (recoverable
   message, retry where meaningful, no stack traces).
4. Responsive: test `xs` (360px) through `lg`; use `Stack`/`Grid` breakpoint props; avoid
   horizontal scroll; keep line length readable (`maxWidth: '65ch'`).
5. Accessibility (WCAG 2.2 AA):
   - semantic landmarks and heading order (`component="main"`, one `h1`);
   - every control reachable and operable by keyboard with a visible focus ring;
   - accessible names (`aria-label` for icon-only buttons and groups);
   - forms: visible labels, `helperText` for errors linked to the field, no placeholder-only
     labels, errors announced and not conveyed by color alone;
   - contrast checked in both light and dark schemes; respect `prefers-reduced-motion`.
   - keyboard shortcuts must not hijack typing in inputs and must be discoverable.
6. Avoid layout shift and hydration mismatches (no `Date.now()`/`Math.random()` in render;
   client-only values rendered after mount, as `ColorSchemeToggle` does).

## Verification

```sh
pnpm lint && pnpm typecheck && pnpm test
pnpm dev:web     # open http://localhost:3000
```

In the browser: check each changed page in light, dark and system modes, at mobile and desktop
widths, keyboard-only (Tab/Shift+Tab/Enter/Space/Escape), and the console for hydration or
key warnings. Automated browser tests with Playwright are **planned, not installed**; do not
claim browser checks you did not perform. Finish with `implementation-verification`.

## References

- https://mui.com/material-ui/
- https://mui.com/material-ui/integrations/nextjs/
- https://mui.com/material-ui/customization/css-theme-variables/overview/
- https://react.dev
- https://www.w3.org/WAI/WCAG22/quickref/
- https://www.w3.org/WAI/ARIA/apg/
