# Frozen test baseline verification

The committed tests are the authoritative handoff artifact; the approved requirements remain authoritative for behavior. Record the [Test Engineer handoff](templates/test-engineer-handoff.md) after committing tests. Include every protected test, fixture and helper as an explicit repository-relative file path. Do not use directory-only entries or patterns. The owner reviews completeness and the recorded Issue revision/body SHA-256 before Session 2.

## Git procedure

Use existing Git rather than a new TypeScript utility: commit resolution, ancestry and literal-path diff already supply the required checks without another runtime or editable verifier. Run from the repository root. The examples use PowerShell; substitute reviewed full commit SHAs and the complete protected file list, never raw untrusted Issue text.

```powershell
$baseline = '<full test commit SHA>'
$final = '<full implementation commit SHA>'
$protected = @('packages/core/src/example.test.ts', 'fixtures/example.json')

git rev-parse --verify "${baseline}^{commit}"
if ($LASTEXITCODE -ne 0) { throw 'Missing or invalid baseline commit' }
git rev-parse --verify "${final}^{commit}"
if ($LASTEXITCODE -ne 0) { throw 'Missing or invalid final commit' }
git merge-base --is-ancestor $baseline $final
if ($LASTEXITCODE -ne 0) { throw 'Baseline is not an ancestor of final commit' }
if ($protected.Count -eq 0) { throw 'Protected file list is empty' }

foreach ($file in $protected) {
  $objectType = git cat-file -t "${baseline}:$file"
  if ($LASTEXITCODE -ne 0 -or $objectType -ne 'blob') {
    throw "Protected path is missing or is not a file at baseline: $file"
  }
}

$paths = @($protected | ForEach-Object { ':(top,literal)' + $_ })
git diff --exit-code --no-ext-diff --no-textconv --no-renames $baseline $final -- $paths
if ($LASTEXITCODE -ne 0) { throw 'Frozen baseline differs or comparison failed' }

# Compare the index and working tree separately so opposite edits cannot cancel.
git diff --cached --exit-code --no-ext-diff --no-textconv --no-renames $baseline -- $paths
if ($LASTEXITCODE -ne 0) { throw 'Index differs from the baseline or comparison failed' }
git diff --exit-code --no-ext-diff --no-textconv --no-renames -- $paths
if ($LASTEXITCODE -ne 0) { throw 'Working tree differs from the index or comparison failed' }
git status --short
```

First verify the handoff's base commit and intended base branch, confirm base is an ancestor of the test commit, and inspect `git show --stat <test SHA>` and the test-phase diff. Compare the approved protected-path list with all test/fixture/helper changes, including any explicitly authorized nonfunctional scaffolding. For pre-implementation review use the checked-out task branch head as `$final`. Use a normal checkout with the complete protected files present. Fetch recorded commits if needed in a shallow checkout. Any check failure blocks verification until resolved.

`--no-renames` exposes a renamed protected file as deletion. Literal root paths prevent filename characters from becoming pathspec patterns. Comparing both committed endpoints and the checkout detects modified/deleted tests and changed fixtures/helpers, including staged or unstaged edits. Also inspect `git diff --cached --name-status` for staged changes; Git status and full-diff review catch untracked files, discovery changes and bypasses outside the protected list. Run tests as well: unchanged bytes alone do not prove execution or correctness.

## Limits and approved corrections

This check compares final file contents; it does not attest that intermediate commits never touched them. It cannot prove completeness of the recorded list, correctness of tests, execution of two conversations or owner approval. An editable SHA/list can be replaced, and unchanged tests can still be bypassed through runner configuration, helper substitution or fixture-specific production logic. Review the whole diff and exact test commands. No frozen-baseline check is currently CI-enforced because no independently trusted reference exists in the workflow. Existing CI gates remain unchanged.

If a frozen test conflicts with requirements, stop implementation, name the exact conflict and proposed correction, and obtain explicit owner approval. Record approval, original and replacement SHAs, changed protected paths, reason, updated criteria mapping and re-observed RED/regression results. Commit the correction separately and preserve the original baseline history. Reverify against the approved replacement; do not silently edit expectations or rewrite history.
