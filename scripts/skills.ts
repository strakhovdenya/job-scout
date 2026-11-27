import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { lintIssue, readSections } from './issue-contract.ts';

const templates = new Map([
  ['epic-discovery', ['Problem and value', 'Acceptance criteria']],
  ['prd', ['Goal', 'Acceptance criteria', 'Open questions']],
  ['technical-plan', ['Implementation phases', 'Traceability and unresolved decisions']],
  ['adr', ['Context', 'Alternatives considered', 'Decision', 'Consequences']],
  ['implementation-verification', ['Acceptance criteria', 'Checks', 'Diff review']],
]);

export function skillIdentity(folder: string, markdown: string): string | undefined {
  const header = /^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/.exec(markdown)?.[1] ?? '';
  const names = [...header.matchAll(/^name: *([a-z0-9-]+) *$/gm)];
  const descriptions = [...header.matchAll(/^description: *([^\r\n]+)$/gm)];
  const name = names[0]?.[1];
  const description = descriptions[0]?.[1]?.trim() ?? '';
  if (
    names.length !== 1 ||
    descriptions.length !== 1 ||
    folder !== name ||
    !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(folder) ||
    folder.length > 64 ||
    !description ||
    description === '>' ||
    description === '|' ||
    description.length > 1024
  )
    return undefined;
  return name;
}

function read(root: string, file: string): string {
  const target = path.join(root, file);
  return existsSync(target) ? readFileSync(target, 'utf8') : '';
}

function brokenLinks(root: string, file: string, markdown: string): string[] {
  const base = path.dirname(path.resolve(root, file));
  const errors: string[] = [];
  for (const match of markdown.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    const link = match[1];
    if (link === undefined || /^[a-z][a-z0-9+.-]*:/i.test(link)) continue;
    const target = path.resolve(base, link);
    const relative = path.relative(root, target);
    if (
      path.isAbsolute(relative) ||
      relative === '..' ||
      relative.startsWith('..' + path.sep) ||
      !existsSync(target)
    ) {
      errors.push(file + ': invalid local link ' + link);
    }
  }
  return errors;
}

export function checkSkills(root: string): string[] {
  const problems: string[] = [];
  const inventory = read(root, 'docs/skills-inventory.md');
  const agents = read(root, 'AGENTS.md');
  problems.push(...brokenLinks(root, 'AGENTS.md', agents));
  const directory = '.agents/skills';
  const names = new Set<string>();
  const inventoryNames = [...inventory.matchAll(/^\| `([a-z0-9-]+)`\s*\|/gm)].map((row) => row[1]);
  for (const dir of readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const file = directory + '/' + dir.name + '/SKILL.md';
    const markdown = read(root, file);
    const name = skillIdentity(dir.name, markdown);
    if (name === undefined || names.has(name)) {
      problems.push(file + ': missing, invalid or duplicate identity');
      continue;
    }
    names.add(name);
    if (inventoryNames.filter((entry) => entry === name).length !== 1)
      problems.push(file + ': expected one inventory row');
    problems.push(...brokenLinks(root, file, markdown));
    const references = path.join(root, directory, name, 'references');
    if (existsSync(references)) {
      for (const entry of readdirSync(references, { withFileTypes: true, recursive: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
        const relative = path.relative(root, path.join(entry.parentPath, entry.name));
        problems.push(...brokenLinks(root, relative, read(root, relative)));
      }
    }
  }
  for (const name of inventoryNames) {
    if (name !== undefined && !names.has(name))
      problems.push('Inventory lists unknown skill ' + name);
  }
  for (const match of agents.matchAll(/<!-- skills:start -->([\s\S]*?)<!-- skills:end -->/g)) {
    for (const entry of (match[1] ?? '').matchAll(/`([a-z][a-z0-9-]*)`/g)) {
      if (entry[1] !== undefined && !names.has(entry[1]))
        problems.push('AGENTS.md: unknown skill ' + entry[1]);
    }
  }
  if (!agents.includes('<!-- skills:start -->')) problems.push('AGENTS.md: missing skill routing');
  for (const [name, headings] of templates) {
    const file = 'docs/templates/' + name + '.md';
    const { content, errors } = readSections(read(root, file));
    problems.push(...errors.map((error) => file + ': ' + error));
    for (const heading of headings) {
      if (!content.get(heading)?.length) problems.push(file + ': missing section ' + heading);
    }
  }
  problems.push(...lintIssue(read(root, 'docs/templates/github-issue.md')));
  return problems;
}

if (import.meta.main) {
  const problems = checkSkills(path.resolve(import.meta.dirname, '..'));
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else console.log('Skill identities, references and canonical templates passed.');
}
