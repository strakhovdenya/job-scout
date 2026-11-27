# JobScout skill inventory

Thirty-two repository-local skills live under `.agents/skills/<name>/SKILL.md` with
`name` and `description` front matter. [OpenAI's skill documentation](https://learn.chatgpt.com/docs/build-skills)
describes repository discovery. Names identify the local skills, even when the environment
also offers global skills in the selector. Static means covered by `pnpm lint:skills`
for identity, inventory and selected local references. It does not certify skill execution
or the quality of generated artifacts. The local Codex app-server
(`0.171.0-alpha.13.2`) returned all 30 M1.1 repository skills with no discovery errors
from `skills/list`. That check predates the M1.2 role skills and did not run the imported workflows.

| Skill                         | Purpose                                | Trigger                                           | Origin and license                                                                    | Local adaptation                                                                             | Validation |
| ----------------------------- | -------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| `ai-evaluation`               | Screening quality                      | Prompt, model or fixture changes                  | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `firestore`                   | Server persistence and emulation       | SDK, queries, retention or emulator data          | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `free-tier-governance`        | Cost and quota bounds                  | Usage or resource changes                         | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `frontend-ui-ux`              | Job inbox UI and accessibility         | React UI, states and interaction                  | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `gcp-terraform`               | Google Cloud and HCL design            | Resource, provider, IAM or CI infra               | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `google-adk`                  | TypeScript ADK boundary                | Agent, model, instruction or runner changes       | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `implementation-verification` | Evidence and completion                | Verification before reporting completion          | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `job-source-integration`      | Permitted vacancy sources              | Feasibility, fetchers or lifecycle                | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `llm-provider-routing`        | Planned quotas and fallback            | Provider and resilience design                    | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `local-development`           | Emulator and offline workflow          | Local runs, seeding and troubleshooting           | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `nextjs-fullstack`            | Server and App Router boundaries       | Web routes, rendering and config                  | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `security-review`             | Threat and secrets review              | Sensitive boundaries and deployment changes       | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `typescript-engineering`      | Workspace and TypeScript conventions   | App/package changes and tests                     | Custom, JobScout M1 (`ffc58055e5991f7f9514bb7f9437f1502ddef06d`)                      | Project-native; updated where M1.1 changes its contract                                      | Static     |
| `js-conventions`              | Naming and readable code               | JavaScript style changes                          | Imported [metaskills 1.0.5][meta], MIT                                                | Repo ESLint, Prettier and absence conventions; hot-path guidance qualified                   | Static     |
| `js-gof`                      | Pattern tradeoffs and examples         | A demonstrated variation point or design review   | Imported [metaskills 1.0.5][meta], MIT                                                | Repository compatibility preface; keep examples and prefer composition                       | Static     |
| `js-data-structures`          | Native collection semantics            | Choosing Array, Map, Set or typed arrays          | Imported [metaskills 1.0.5][meta], MIT                                                | Project scope; complementary to custom collections                                           | Static     |
| `data-structures`             | Non-native collections                 | Justified queue, heap, graph or cache             | Imported [metaskills 1.0.5][meta], MIT                                                | Project scope; choose primitives first                                                       | Static     |
| `error-handling`              | Error classification and recovery      | Retries, shutdown or error boundaries             | Imported [metaskills 1.0.5][meta], MIT                                                | Fix sample catch bindings, classify retries and preserve fatal exit                          | Static     |
| `modern-javascript`           | ECMAScript semantics and compatibility | Runtime features, async behavior and cancellation | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `epic-discovery`              | Feasibility and phase status           | Significant functionality or next-phase analysis  | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `prd`                         | Product and acceptance scope           | Requirements draft and owner approval             | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `plan`                        | Technical design and phases            | Approved PRD decomposition                        | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `issues`                      | Formal scoped tasks                    | Approved plan to reviewable issues                | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `adr`                         | Persistent architecture decisions      | Architecture design or change                     | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `task-lifecycle`              | One approved task and traceability     | Branch, implementation and PR handoff             | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `test-engineer`               | Independent tests and frozen baseline  | Session 1 for an approved functional Issue        | Custom, JobScout M1.2                                                                 | Test-only commit, RED evidence and owner handoff                                             | Static     |
| `implementation-engineer`     | Implement against frozen tests         | Fresh session after owner handoff review          | Custom, JobScout M1.2                                                                 | Baseline comparison, final PR and owner review                                               | Static     |
| `code-review`                 | Scoped read-only review                | Review correctness and regression risk            | Custom adaptation, [Dark Factory 0.1.3][df]; no upstream redistribution license found | Independently written for Codex with repository contracts                                    | Static     |
| `material-ui-styling`         | MUI v9 scope, tokens and slots         | Styling and theme decisions                       | Imported [Material UI 1.0.0][mui], MIT                                                | Preserve guide and reference as local files                                                  | Static     |
| `playwright`                  | Browser verification and snapshots     | Local UI evidence                                 | Imported [OpenAI Playwright][pw], Apache-2.0; Microsoft notice                        | Retain CLI/workflow references; remove globals and auto-downloading wrapper                  | Static     |
| `terraform-style-guide`       | HCL naming and security                | Terraform authoring and review                    | Imported [HashiCorp][tf], MPL-2.0                                                     | Preserve style/security references; apply GCP scope, existing versions and explicit approval | Static     |
| `vercel-react-best-practices` | Rendering and request performance      | React and Next.js performance                     | Imported [Vercel Engineering 1.0.0][react], MIT declared in skill                     | Select relevant source rules; omit deployment, packages and unrelated caching advice         | Static     |

[meta]: https://www.npmjs.com/package/metaskills/v/1.0.5
[df]: https://github.com/strakhovdenya/dark-factory/tree/d8de89b9875fc5f03d9aa1cab95e66664045d74e
[mui]: https://github.com/mui/material-ui/tree/a26374c0ffa5e7e574ca2bea93fe6770d414bfe3/skills/material-ui-styling
[pw]: https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright
[tf]: https://github.com/hashicorp/agent-skills/tree/5e30fa5c867ba6777c37e4206babfd08049c396f/plugins/terraform/skills/terraform-style-guide
[react]: https://github.com/vercel-labs/agent-skills/tree/5a37a6329fbad3666c3207392a6a7c0110e92efb/skills/react-best-practices

## Dark Factory source resolution

Read the local Dark Factory checkout at `d8de89b9875fc5f03d9aa1cab95e66664045d74e`
(package version 0.1.3). Its `skills/base-set.json` declares five skills from
Metarhia's npm package `metaskills@1.0.5`. The installer resolves that pinned
package and project skill directories and copies them into a client-specific setup.
Use the resolved package sources and MIT notices. JobScout installs no external
runtime, package or installer for these skills.

Dark Factory provides its own `modern-javascript` and references and the six
process skills. The pinned tree and package manifest did not supply a redistribution
license. The local modern skill uses independent Node/ECMA/TC39 guidance. The
process skills and templates reproduce the workflow and contract at the level
of required fields, semantics and gates, using original JobScout wording and
a standalone TypeScript validator. Sources reviewed include
`skills/templates.js`, `verifier/issue-contract.md` and its JSON and linter,
scope and approval checks, `profile/skill-rules.js`, and the verify, PR writer
and review procedures. Dark Factory's review wrapper used a separately bundled
skill, so JobScout provides its own report-only review procedure. No source
scripts, hooks, controller, profile or privileged runtime were copied.

## Vendor candidates and dispositions

- **OpenAI** at `49f948faa9258a0c61caceaf225e179651397431`: select Playwright CLI guidance for browser reviews. The wrapper called an unpinned package via npx and was reviewed and omitted. Interactive Playwright overlaps with the existing in-app browser. Preserve Apache license and upstream notice.
- **Vercel** at `5a37a6329fbad3666c3207392a6a7c0110e92efb`: React performance guidance fits the existing framework. Retain selected rules, skip Vercel deploy, CLI, caching and React Native skills. React's own [documentation](https://react.dev/learn) remains the behavioral authority; no standalone application skill was selected from React at `edae846a9a17442c00429f2b15375afbfa0376c9`.
- **Next.js** at `88e091f9da3bf321b4ffdf48c75c672bd0579745` (MIT): version-matched bundled docs cover App Router, RSC and server/client boundaries. The upstream skills are focused on specialized optimization and Next.js internals. Retain `nextjs-fullstack` and consult the installed docs instead of adding a competing general workflow. Keep the repository's own agent rules.
- **Material UI** at `a26374c0ffa5e7e574ca2bea93fe6770d414bfe3`: select the vendor's styling skill for MUI v9 and keep JobScout accessibility and product-state guidance in `frontend-ui-ux`.
- **Google** at `4d3b4526d54107f92c01ed4057220f249bb17e75` (Apache-2.0): `cloud-run-basics` includes jobs but assumes deployment, API activation, roles and examples for public invocation or unrelated worker pools. IAM helpers operate on live policies. Use vendor docs for [Cloud Run](https://cloud.google.com/run/docs/overview/what-is-cloud-run), [scheduled jobs](https://cloud.google.com/run/docs/execute/jobs-on-schedule) and [deployment federation](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines). Keep infrastructure guidance scoped to `gcp-terraform`. Use [ADK JS](https://github.com/google/adk-js) and installed TypeScript types; Python/Agent Platform workflows are not equivalent.
- **Firebase** at `99954a30898bb5ddc8152ee10e124dc3b4106bf7` (Apache-2.0): `firebase-firestore` prefers Enterprise provisioning, client SDKs and a rules deploy. Keep the Standard Native server SDK workflow and emulation safeguards. Use the vendor's [agent skills index](https://firebase.google.com/docs/ai-assistance/agent-skills), [emulator guide](https://firebase.google.com/docs/emulator-suite/connect_firestore) and [pricing](https://firebase.google.com/docs/firestore/pricing) as references.
- **HashiCorp** at `5e30fa5c867ba6777c37e4206babfd08049c396f`: the style and security docs fit HCL review. Provider authoring, Terraform Stacks and live import workflows are outside the project. Preserve the MPL license for included material.

Vendor selection was based on pinned trees, complete selected instructions and
their referenced text, license evidence and script review. Review notes are not
endorsements of all recommendations. No imported executable scripts or lifecycle
dependencies ship with the skills. External operations still follow `AGENTS.md`.
