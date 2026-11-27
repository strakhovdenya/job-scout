---
name: security-review
description: Security review checklist for JobScout changes. Use when asked for a security review or audit, before merging changes that touch authentication, secrets, environment config, source fetchers, rendering of vacancy text, AI prompts, dependencies, CI workflows, Dockerfiles, Terraform or IAM, or when handling personal data.
---

# Security review

## Workflow

1. Determine scope: `git diff` (or the files/PR named by the user). Read changed code and its
   callers; do not review from file names alone.
2. Walk the checklist below for every area the change touches.
3. Report findings, most severe first. Each finding:
   `[Critical|High|Medium|Low] path/to/file.ts:LINE — problem — impact — concrete fix`.
   Separate confirmed issues from hardening suggestions. If nothing is found, say which areas
   were checked. Do not modify code unless asked.

## Checklist

**Authentication / authorization** — Auth.js with Google OAuth is planned, not installed.
New server endpoints that expose or mutate user data must not ship without an auth decision;
never trust client-supplied user IDs; `JOBSCOUT_MOCK_AUTH` stays local-only (rejected in
production by `loadRuntimeConfig`).

**Configuration and environment isolation** — all runtime config flows through
`loadRuntimeConfig` (fail closed); no bypass or weakened checks; production rejects emulator
host, `demo-` projects, mock auth and offline providers; `createFirestore` env/config
consistency and `assertLocalEmulatorTarget` guards intact.

**Secrets** — none in code, fixtures, logs, Docker images, Terraform or tests; `.env*` and
`*.tfvars` gitignored; no secrets via `NEXT_PUBLIC_*`; production secrets planned in Secret
Manager; logs never print API keys, tokens or full prompts with personal data.

**Input validation** — Zod at every boundary (HTTP bodies/params, env, source payloads, model
output, Firestore reads). Error responses do not leak stack traces or config.

**SSRF / outbound HTTP** — source fetchers use an allowlist of hosts, `https`, bounded
redirects re-checked against the allowlist, timeouts, response size limits; never fetch URLs
taken from vacancy text or user input without allowlisting; block private/link-local ranges.

**XSS / rendering** — vacancy descriptions are untrusted HTML/text: render as text or sanitize
with a vetted sanitizer and strict allowlist before rendering; never `dangerouslySetInnerHTML`
with unsanitized content; external links use `rel="noopener noreferrer"`.

**Prompt injection** — vacancy data is one JSON object; serialization is a structural boundary, not a model security guarantee. The instruction marks it as
untrusted; no tools with side effects driven by model output; output re-validated with Zod;
`enforceGroundedSkip` filters unsupported quotes and downgrades unsupported skips. Textual matches do not validate conclusions. Use `AbortSignal` for timeouts.

**Dependencies** — new packages justified and used; `pnpm-lock.yaml` diff reviewed
(unexpected packages, registries, version jumps); `allowBuilds` entries reviewed; run
`pnpm audit --prod` and report findings (needs network); no Claude/Anthropic tooling.

**CI (`.github/workflows`)** — top-level `permissions: contents: read`, elevated permissions
only per job with reason; third-party actions pinned to full commit SHA with version comment;
`persist-credentials: false`; no secrets in `pull_request` from forks; WIF instead of keys
for future deploys.

**Containers** — multi-stage builds, runtime `USER node`, no secrets in build args or layers,
`.dockerignore` excludes `.env*`, `.git`, `infra`, docs; pinned base image; minimal runtime.

**Cloud / Terraform** — least-privilege IAM at resource level, no primitive roles, no
`allUsers` unless intentionally public; sensitive variables/outputs marked `sensitive`; state
in a restricted, versioned bucket (planned); no state or tfvars committed.

**Personal data** — collect only what screening needs; no CVs, recruiter personal data or
real listings in fixtures (`.example` domains); retention/TTL considered; application vs
general contact emails stored only as stated by the source.

## Useful commands

```sh
git diff --stat && git diff
pnpm audit --prod
pnpm lint && pnpm typecheck && pnpm test
```

## References

- https://owasp.org/www-project-top-ten/
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- https://genai.owasp.org/llm-top-10/
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
- https://cloud.google.com/iam/docs/using-iam-securely
- https://pnpm.io/cli/audit
