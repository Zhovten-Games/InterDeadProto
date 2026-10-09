import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root, readJson, hashFile, sha256 } from './lib.mjs';
import Ajv from '../proto-dev/node_modules/ajv/dist/2020.js';
const require = createRequire(path.join(root, 'proto-dev/package.json'));
const { parse } = require('espree');
const yaml = require('js-yaml');
const { unified } = await import('../proto-dev/node_modules/unified/index.js');
const { default: markdown } = await import('../proto-dev/node_modules/remark-parse/index.js');
const { default: gfm } = await import('../proto-dev/node_modules/remark-gfm/index.js');

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else result.push(path.relative(root, file).split(path.sep).join('/'));
  }
  return result.sort();
}
const codeMap = await readJson(path.join(root, 'codemap.manifest.json'));
const validateManifest = new Ajv({ allErrors: true, strict: true }).compile(
  await readJson(path.join(root, 'build/schemas/codemap-manifest.schema.json')),
);
if (!validateManifest(codeMap))
  throw new Error(`Invalid local CodeMap manifest: ${JSON.stringify(validateManifest.errors)}`);
if (codeMap.schemaVersion !== '2.0.0' || codeMap.runner?.command !== 'node build/check-source.mjs')
  throw new Error('Unsupported project-local CodeMap runner/schema');
const topology = await readJson(path.join(root, 'docs/proto-dev/technical/source-topology.json'));
const sourceFiles = await files(path.join(root, 'proto-dev/src'));
const errors = [];
const corpus = await readJson(path.join(root, 'manifest/test-corpus.json'));
for (const { path: name } of corpus.active) {
  try {
    await stat(path.join(root, name));
  } catch {
    errors.push(`Missing active test: ${name}`);
  }
  if (
    !name
      .split('/')
      .slice(2)
      .every((part) => /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(part))
  )
    errors.push(`Non-kebab test path: ${name}`);
}
const registered = [...topology.entries, ...topology.extensions];
if (
  topology.entries.length !== 208 ||
  new Set(topology.entries.map((row) => row.oldPath)).size !== 208
)
  errors.push('Incomplete baseline source inventory');
const mapped = registered.map((row) => row.newPath);
if (new Set(mapped.map((name) => name.toLowerCase())).size !== mapped.length)
  errors.push('Case-insensitive source collision');
for (const name of sourceFiles)
  if (!mapped.includes(name)) errors.push(`Unregistered source: ${name}`);
for (const name of mapped)
  if (!sourceFiles.includes(name)) errors.push(`Missing registered source: ${name}`);
const graph = [];
for (const name of sourceFiles) {
  if (
    !name
      .split('/')
      .slice(2)
      .every((part) => /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(part))
  )
    errors.push(`Non-kebab source name: ${name}`);
  if (
    /^proto-dev\/src\/(?:adapters|application|core|infrastructure|ports|utils|presentation)\//.test(
      name,
    )
  )
    errors.push(`Non-semantic first level: ${name}`);
  if (!name.endsWith('.js')) continue;
  const text = await readFile(path.join(root, name), 'utf8');
  let syntax;
  try {
    syntax = parse(text, { ecmaVersion: 'latest', sourceType: 'module' });
  } catch (error) {
    errors.push(`${name}: ${error.message}`);
    continue;
  }
  const imports = syntax.body.flatMap((node) => (node.source?.value ? [node.source.value] : []));
  for (const reference of imports) {
    if (!reference.startsWith('.')) continue;
    const target = path
      .normalize(path.join(path.dirname(name), reference))
      .split(path.sep)
      .join('/');
    try {
      if (!(await stat(path.join(root, target))).isFile()) throw new Error();
    } catch {
      errors.push(`Unresolved import: ${name} → ${reference}`);
    }
    if (
      /^proto-dev\/src\/narrative-runtime\/(?:dialog|engine|sequence|dsl)\//.test(name) &&
      /src\/(?:app-shell|camera|messenger)\/(?!configuration)/.test(target)
    )
      errors.push(`Domain depends on application/presentation: ${name} → ${target}`);
    graph.push({ from: name, to: target });
  }
}
const docFiles = await files(path.join(root, 'docs/proto-dev/src'));
const documented = new Set();
const localLinks = [];
const required = [
  'source',
  'source_exists',
  'imports',
  'implements',
  'owns',
  'listens',
  'emits',
  'used_by',
  'runtime_role',
  'contour_primary',
  'role_group',
];
for (const name of docFiles.filter((name) => name.endsWith('.md'))) {
  const text = await readFile(path.join(root, name), 'utf8');
  const end = text.startsWith('---\n') ? text.indexOf('\n---', 4) : -1;
  if (end < 0) {
    errors.push(`Missing CodeMap frontmatter: ${name}`);
    continue;
  }
  let metadata;
  try {
    metadata = yaml.load(text.slice(4, end));
  } catch (error) {
    errors.push(`Invalid CodeMap YAML: ${name}: ${error.message}`);
    continue;
  }
  for (const field of required)
    if (metadata?.[field] === undefined || metadata?.[field] === null)
      errors.push(`Missing ${field}: ${name}`);
  const source = `proto-dev/${metadata?.source}`;
  if (!sourceFiles.includes(source) || metadata.source_exists !== true)
    errors.push(`CodeMap source mismatch: ${name}`);
  else documented.add(source);
  for (const field of ['imports', 'implements', 'owns', 'listens', 'emits', 'used_by'])
    if (!Array.isArray(metadata[field])) errors.push(`Invalid CodeMap ${field}: ${name}`);
  const syntax = unified()
    .use(markdown)
    .use(gfm)
    .parse(text.slice(end + 4));
  function visit(node) {
    if (node.type === 'link' || node.type === 'definition') {
      const url = node.url.split('#')[0];
      if (url && !/^[a-z]+:|^\//i.test(url)) {
        const target = path.resolve(path.dirname(path.join(root, name)), decodeURI(url));
        // Local documentation links must resolve; remote Git references are informational.
        graph.push({ documentation: name, target });
        localLinks.push({ name, url, target });
      }
    }
    for (const child of node.children || []) visit(child);
  }
  visit(syntax);
}
for (const link of localLinks) {
  try {
    await stat(link.target);
  } catch {
    errors.push(`Broken documentation link: ${link.name} → ${link.url}`);
  }
}
for (const name of sourceFiles)
  if (!documented.has(name)) errors.push(`Undocumented module: ${name}`);
const map = await readJson(path.join(root, 'build/artifact-map.json'));
const publicNames = new Set();
for (const mapping of map.templates) {
  if (
    !sourceFiles.includes(mapping.source) ||
    publicNames.has(mapping.publicPath) ||
    !/^src\/presentation\/templates\/[a-z0-9/-]+\.html$/.test(mapping.publicPath)
  )
    errors.push(`Invalid public template mapping: ${mapping.source}`);
  publicNames.add(mapping.publicPath);
}
if (map.templates.length !== 17) errors.push('Template corpus must retain 17 entries');
const localeEntries = {};
for (const language of ['en', 'ru', 'uk', 'ja']) {
  localeEntries[language] = {};
  for (const domain of ['common', 'ghosts', 'loader', 'ui']) {
    const file = path.join(root, map.locales.source, language, `${domain}.json`);
    const dictionary = await readJson(file);
    if (!dictionary || Array.isArray(dictionary) || typeof dictionary !== 'object')
      errors.push(`Invalid dictionary: ${file}`);
    localeEntries[language][domain] = await hashFile(file);
  }
}
const result = {
  schemaVersion: 1,
  mechanism:
    'Project-local CodeMap source/docs/static boundary validator; runtime behavior is checked separately',
  status: errors.length ? 'failed' : 'passed',
  sourceFiles: sourceFiles.length,
  documented: documented.size,
  manifestSha256: await hashFile(path.join(root, 'codemap.manifest.json')),
  topologySha256: sha256(JSON.stringify(topology)),
  localeEntries,
  graph,
  errors,
};
await mkdir(path.join(root, 'build/results'), { recursive: true });
await writeFile(
  path.join(root, 'build/results/source-check.json'),
  JSON.stringify(result, null, 2) + '\n',
);
for (const error of errors) process.stderr.write(`${error}\n`);
process.stdout.write(
  `Source/CodeMap: ${sourceFiles.length} modules, ${documented.size} documented, ${errors.length} errors\n`,
);
process.exitCode = errors.length ? 1 : 0;
