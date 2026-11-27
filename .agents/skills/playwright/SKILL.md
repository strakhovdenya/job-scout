---
name: playwright
description: Inspect and verify JobScout browser flows with fresh snapshots, scoped browser actions and reproducible evidence.
license: Apache-2.0
---

# Playwright browser verification

Adapted from OpenAI's Playwright skill, with the upstream Microsoft attribution
in NOTICE.txt. Prefer the in-app browser when the workspace supplies it. If using
Playwright CLI, check `playwright-cli --help` before proceeding with an already
available reviewed installation. Use the workspace's browser setup and avoid
global installations or downloads triggered by skill activation.

1. Navigate to the authorized local or preview URL.
2. Snapshot and use references from that snapshot for clicks and form actions.
3. Re-snapshot after navigation, dialogs, tab switches or UI changes.
4. Verify the expected outcome and relevant empty, error, keyboard and viewport
   behavior. Save screenshots or traces only when useful, in a temporary folder.
5. Report browser, viewport and reproducible evidence. Close only sessions you start.

Use synthetic input and avoid collecting credentials, cookies or personal data
in artifacts. Prefer small explicit commands and keep test files within authorized test scope.
See [CLI commands](references/cli.md) and [workflows](references/workflows.md).
