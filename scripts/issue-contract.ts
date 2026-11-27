import { readFileSync } from 'node:fs';

export const sections = [
  ['Context', null],
  ['Affects', null],
  ['Docs to Read', null],
  ['Key Invariants', 'INV'],
  ['Acceptance Criteria', 'AC'],
  ['Test Requirement', 'TR'],
  ['Definition of Done', 'DOD'],
  ['Dependencies', null],
] as const;
const manual = 'Manual verification (owner, not gated)';
const checkItem = /^- \[[ xX]\] ([A-Z]+-[1-9]\d*) \[([a-z]+)\] (.+?)\. Verify: (.+)$/;
const invariant = /^- (INV-[1-9]\d*) (.+)$/;
const pathSegment = String.raw`(?!\.{1,2}(?:/|$| ))[\w.@-]+`;
const repositoryPath = `${pathSegment}(?:/${pathSegment})*`;
const evidence = new Map<string, RegExp>([
  ['behavior', new RegExp(`^${repositoryPath}\\.(?:spec|test)\\.[cm]?[jt]sx? "[^"]+"$`)],
  ['doc', new RegExp(`^${repositoryPath}$`)],
  ['config', new RegExp(`^${repositoryPath}$`)],
  ['ci', /^ci "[^"]+"$/],
  ['absence', new RegExp(`^absent "[^"]+" in ${repositoryPath}$`)],
]);
const invalidWording =
  /^(?:if )|\b(?:if applicable|manually|locally|merged into|comment on the issue)\b/i;

export function readSections(markdown: string): {
  content: Map<string, string[]>;
  errors: string[];
} {
  const content = new Map<string, string[]>();
  const errors: string[] = [];
  let section: string[] | undefined;
  let fence: string | undefined;
  for (const line of markdown.split(/\r?\n/)) {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    const delimiter = marker?.[1];
    if (
      delimiter !== undefined &&
      (fence === undefined || (delimiter.startsWith(fence) && marker?.[2]?.trim() === ''))
    ) {
      fence = fence === undefined ? delimiter : undefined;
      continue;
    }
    if (fence !== undefined) continue;
    const title = /^## (.+?)\s*$/.exec(line)?.[1];
    if (title !== undefined) {
      if (content.has(title)) errors.push('Duplicate heading: ' + title);
      section = [];
      content.set(title, section);
    } else if (line.trim()) {
      section?.push(line.trimEnd());
    }
  }
  if (fence !== undefined) errors.push('Unclosed code fence.');
  return { content, errors };
}

export function lintIssue(markdown: string): string[] {
  const { content, errors } = readSections(markdown);
  const seen = new Set<string>();
  for (const [section, prefix] of sections) {
    const lines = content.get(section);
    if (!lines?.length) {
      errors.push('Missing or empty section: ' + section);
      continue;
    }
    if (prefix === null) continue;
    const items = lines.filter((line) => /^ ?(?:[-*+]|\d+[.)])\s+\S/.test(line));
    if (!items.length) errors.push('Expected a checkable item in ' + section);
    for (const line of items) {
      const match = (prefix === 'INV' ? invariant : checkItem).exec(line);
      if (!match?.[1]?.startsWith(prefix + '-')) {
        errors.push('Invalid ' + prefix + ' item: ' + line);
        continue;
      }
      const id = match[1];
      if (seen.has(id)) errors.push('Duplicate item ID: ' + id);
      seen.add(id);
      if (prefix === 'INV') {
        if (invalidWording.test(match[2] ?? '')) errors.push('Non-verifiable wording: ' + id);
        continue;
      }
      const [, , type = '', description = '', verify = ''] = match;
      if (evidence.get(type)?.test(verify) !== true) errors.push('Invalid evidence target: ' + id);
      if (invalidWording.test(description)) errors.push('Non-verifiable wording: ' + id);
    }
  }
  if (content.get(manual)?.some((line) => /\b(?:AC|INV|TR|DOD)-\d+\b/.test(line))) {
    errors.push('Owner-run checks cannot use gated item IDs.');
  }
  return errors;
}

if (import.meta.main) {
  const file = process.argv[2];
  const errors =
    file === undefined || process.argv.length !== 3
      ? ['Usage: pnpm lint:issue <issue.md>']
      : lintIssue(readFileSync(file, 'utf8'));
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Issue format passed.');
}
