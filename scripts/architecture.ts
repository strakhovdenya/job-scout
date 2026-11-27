import path from 'node:path';
import { isBuiltin } from 'node:module';
import ts from 'typescript';

const modules = [
  'apps/web',
  'apps/worker',
  'packages/core',
  'packages/agent',
  'packages/firestore',
];
const shared = new Map([
  ['@job-scout/core', 'packages/core'],
  ['@job-scout/agent', 'packages/agent'],
  ['@job-scout/firestore', 'packages/firestore'],
]);

function owner(file: string): string | undefined {
  return modules.find((module) => file.startsWith(module + '/'));
}

function allowedEdge(from: string, to: string): boolean {
  if (from.startsWith('apps/')) return to.startsWith('packages/');
  return from !== 'packages/core' && to === 'packages/core';
}

export function checkArchitecture(root: string): string[] {
  const problems: string[] = [];
  const relative = (file: string) => path.relative(root, file).split(path.sep).join('/');
  const graph = new Map<string, Set<string>>();
  function violation(file: string, message: string) {
    problems.push(file + ': ' + message);
  }

  for (const module of modules) {
    const moduleDir = path.join(root, module);
    const configFile = path.join(moduleDir, 'tsconfig.json');
    const loaded = ts.readConfigFile(configFile, (file) => ts.sys.readFile(file));
    if (loaded.error) {
      violation(module, ts.flattenDiagnosticMessageText(loaded.error.messageText, ' '));
      continue;
    }
    const config = ts.parseJsonConfigFileContent(
      loaded.config,
      ts.sys,
      moduleDir,
      undefined,
      configFile,
    );
    const resolution = ts.createModuleResolutionCache(
      moduleDir,
      (name) => (ts.sys.useCaseSensitiveFileNames ? name : name.toLowerCase()),
      config.options,
    );
    for (const file of ts.sys.readDirectory(
      path.join(moduleDir, 'src'),
      ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
      ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    )) {
      const source = ts.createSourceFile(
        file,
        ts.sys.readFile(file) ?? '',
        ts.ScriptTarget.Latest,
        true,
      );
      const from = relative(file);
      const edges = new Set<string>();
      graph.set(from, edges);
      function addImport(name: string) {
        const sharedModule = shared.get(name);
        if (sharedModule !== undefined) {
          if (!allowedEdge(module, sharedModule)) violation(from, 'forbidden dependency ' + name);
          edges.add(sharedModule + '/src/index.ts');
          return;
        }
        if (name.startsWith('@job-scout/')) {
          violation(from, 'use a public shared package export: ' + name);
          return;
        }
        const resolved = ts.resolveModuleName(
          name,
          file,
          config.options,
          ts.sys,
          resolution,
          undefined,
          ts.ModuleKind.ESNext,
        ).resolvedModule;
        const target =
          resolved === undefined
            ? undefined
            : relative(ts.sys.realpath?.(resolved.resolvedFileName) ?? resolved.resolvedFileName);
        const to = target === undefined ? undefined : owner(target);
        if (to !== undefined && to !== module) {
          violation(from, 'cross-module import must use a public package export: ' + name);
          return;
        }
        if (target !== undefined && to === module) {
          if (!target.startsWith(module + '/src/'))
            violation(from, 'import targets non-source module files: ' + name);
          edges.add(target);
          return;
        }
        if (
          name.startsWith('.') ||
          name.startsWith('/') ||
          name.startsWith('@/') ||
          name.startsWith('#')
        ) {
          violation(from, 'unresolved or out-of-module import: ' + name);
          return;
        }
        if (
          module === 'packages/core' &&
          name !== 'zod' &&
          !(name === 'vitest' && /\.test\.[cm]?[jt]sx?$/.test(from)) &&
          !isBuiltin(name)
        ) {
          violation(from, 'external dependency forbidden in core: ' + name);
        }
      }
      function inspect(node: ts.Node) {
        let specifier: ts.Node | undefined;
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
          specifier = node.moduleSpecifier;
        if (ts.isExternalModuleReference(node)) specifier = node.expression;
        if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
          specifier = node.argument.literal;
        if (
          ts.isCallExpression(node) &&
          (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
        ) {
          specifier = node.arguments[0];
          if (specifier === undefined || !ts.isStringLiteralLike(specifier)) {
            violation(from, 'dynamic module specifiers must be string literals');
          }
        }
        if (specifier !== undefined && ts.isStringLiteralLike(specifier)) addImport(specifier.text);
        ts.forEachChild(node, inspect);
      }
      for (const reference of source.referencedFiles) {
        addImport(
          reference.fileName.startsWith('.') ? reference.fileName : './' + reference.fileName,
        );
      }
      for (const reference of source.typeReferenceDirectives) addImport(reference.fileName);
      inspect(source);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(file: string) {
    if (visiting.has(file)) {
      const chain = [...visiting];
      violation(
        file,
        'dependency cycle: ' + [...chain.slice(chain.indexOf(file)), file].join(' -> '),
      );
      return;
    }
    if (visited.has(file)) return;
    visiting.add(file);
    for (const target of graph.get(file) ?? []) visit(target);
    visiting.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) visit(file);
  return problems.sort();
}

if (import.meta.main) {
  const violations = checkArchitecture(path.resolve(import.meta.dirname, '..'));
  if (violations.length === 0) console.log('Architecture boundaries passed.');
  else {
    console.error(violations.join('\n'));
    process.exitCode = 1;
  }
}
