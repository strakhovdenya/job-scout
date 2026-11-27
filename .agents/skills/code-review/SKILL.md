---
name: code-review
description: Review JobScout diffs for correctness, architectural scope, regressions and test quality before verification.
---

# Code Review

Review the actual diff against its base and approved scope. Read callers and applicable invariants before reporting defects. Keep this review read-only unless asked to implement fixes.

Look for reproducible incorrect behavior, unvalidated inputs, changed public contracts, failure and concurrency bugs, missing error handling, cost regressions and tests changed to hide a defect. Confirm architecture boundaries and inspect dependencies and operational risks for the affected areas. Use `security-review` for sensitive changes.

For independently tested tasks, compare findings against the approved requirements. Review criteria coverage, missing scenarios and whether the tests exercise public behavior at meaningful boundaries. Check [frozen baseline integrity](../../../docs/test-baseline.md), any approved replacement, fixture overfitting and hidden bypasses such as altered test discovery or disabled assertions. Review scope, maintainability and security alongside test quality. A green CI result is necessary where applicable. Owner review remains the final merge boundary.

Report confirmed findings by severity with file and line, trigger, impact and a concrete fix. Treat uncertainty as a question. Separate out-of-scope findings so they do not expand the task. If there are no findings, say which paths and evidence were reviewed and report remaining verification gaps. Re-review material changes before the verification gate.
