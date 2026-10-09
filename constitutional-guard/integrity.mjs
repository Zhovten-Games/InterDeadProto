import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import Ajv from '../proto-dev/node_modules/ajv/dist/2020.js';
import { hashFile, root, readJson } from '../build/lib.mjs';
const require = createRequire(path.join(root, 'proto-dev/package.json'));
const { parse } = require('espree');

export async function verifyIntegrity(manifest, directory = root) {
  const errors = [];
  const schema = await readJson(
    path.join(root, 'constitutional-guard/schemas/history.schema.json'),
  );
  const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
  if (!validate(manifest)) return [`Invalid historical schema: ${JSON.stringify(validate.errors)}`];
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries) || !manifest.entries.length)
    return ['Invalid/empty historical manifest'];
  const ids = new Set(),
    paths = new Set();
  for (const entry of manifest.entries) {
    if (ids.has(entry.id)) errors.push(`Duplicate historical ID: ${entry.id}`);
    ids.add(entry.id);
    if (paths.has(entry.path.toLowerCase()))
      errors.push(`Duplicate/case-colliding historical file: ${entry.path}`);
    paths.add(entry.path.toLowerCase());
    if (
      !/^IDP-WH-[A-Z]+-\d{3}\.v\d+$/.test(entry.id) ||
      !/^constitutional-guard\/history\/[a-z-]+\/v\d+\.mjs$/.test(entry.path)
    ) {
      errors.push(`Invalid historical identity: ${entry.id}`);
      continue;
    }
    if (
      !['active', 'superseded'].includes(entry.status) ||
      !Array.isArray(entry.cases) ||
      !entry.cases.length ||
      new Set(entry.cases).size !== entry.cases.length
    )
      errors.push(`Invalid historical status/cases: ${entry.id}`);
    try {
      if ((await hashFile(path.join(directory, entry.path))) !== entry.sha256)
        errors.push(`Changed historical driver: ${entry.path}`);
    } catch {
      errors.push(`Missing historical driver: ${entry.path}`);
    }
    if (entry.status === 'superseded' && !entry.supersededBy)
      errors.push(`Missing supersededBy: ${entry.id}`);
    if (entry.status === 'active' && entry.supersededBy)
      errors.push(`Active history cannot be superseded: ${entry.id}`);
  }
  for (const entry of manifest.entries) {
    if (entry.supersededBy && (entry.supersededBy === entry.id || !ids.has(entry.supersededBy)))
      errors.push(`Invalid supersededBy: ${entry.id}`);
    if (entry.status === 'superseded') {
      const successor = manifest.entries.find((row) => row.id === entry.supersededBy);
      if (successor?.phase !== entry.phase || successor?.status !== 'active' || !entry.decision)
        errors.push(`Incompatible/orphan successor: ${entry.id}`);
      try {
        await readFile(path.join(directory, entry.decision));
      } catch {
        errors.push(`Missing supersession decision: ${entry.id}`);
      }
    }
    let current = entry;
    const visited = new Set();
    while (current?.supersededBy) {
      if (visited.has(current.id)) {
        errors.push(`Supersession cycle: ${entry.id}`);
        break;
      }
      visited.add(current.id);
      current = manifest.entries.find((row) => row.id === current.supersededBy);
    }
  }
  async function visit(base) {
    for (const entry of await readdir(base, { withFileTypes: true })) {
      const file = path.join(base, entry.name);
      if (entry.isSymbolicLink()) errors.push(`Historical symlink: ${file}`);
      else if (entry.isDirectory()) await visit(file);
      else if (!paths.has(path.relative(directory, file).split(path.sep).join('/').toLowerCase()))
        errors.push(`Unregistered historical file: ${file}`);
    }
  }
  try {
    await visit(path.join(directory, 'constitutional-guard/history'));
  } catch {
    errors.push('Historical corpus unavailable');
  }
  if (!Array.isArray(manifest.protectedDependencies) || !manifest.protectedDependencies.length)
    errors.push('Missing protected dependency/interface registry');
  for (const dependency of manifest.protectedDependencies || []) {
    if (
      !/^(?:(?:constitutional-guard|proto-dev\/tests\/fixtures|proto-dev\/tools|build|manifest|\.github\/workflows)\/[a-zA-Z0-9/._-]+|eslint\.config\.mjs|proto-dev\/(?:package(?:-lock)?\.json|eslint\.config\.mjs))$/.test(
        dependency.path,
      ) ||
      dependency.path.includes('..')
    ) {
      errors.push('Invalid protected dependency path');
      continue;
    }
    try {
      if ((await hashFile(path.join(directory, dependency.path))) !== dependency.sha256)
        errors.push(`Changed protected dependency: ${dependency.path}`);
    } catch {
      errors.push(`Missing protected dependency: ${dependency.path}`);
    }
  }
  const protectedPaths = new Set(
    manifest.protectedDependencies.map((row) => row.path.toLowerCase()),
  );
  if (protectedPaths.size !== manifest.protectedDependencies.length)
    errors.push('Duplicate/case-colliding protected dependency');
  for (const entry of manifest.entries)
    for (const dependency of entry.dependencies)
      if (!protectedPaths.has(dependency.toLowerCase()))
        errors.push(`Unprotected behavioral dependency: ${entry.id} → ${dependency}`);
  for (const contract of manifest.productionContracts || []) {
    try {
      const syntax = parse(await readFile(path.join(directory, contract.path), 'utf8'), {
        ecmaVersion: 'latest',
        sourceType: 'module',
      });
      const exported = syntax.body.find(
        (node) => node.type === 'ExportDefaultDeclaration',
      )?.declaration;
      const methods =
        exported?.body?.body
          ?.filter((node) => node.type === 'MethodDefinition')
          .map((node) => node.key.name) || [];
      if (!exported || contract.methods.some((name) => !methods.includes(name)))
        errors.push(`Changed protected public interface: ${contract.path}`);
    } catch {
      errors.push(`Unavailable protected public interface: ${contract.path}`);
    }
  }
  return errors;
}

export async function checkIntegrity() {
  const manifest = await readJson(path.join(root, 'constitutional-guard/manifest/history.json'));
  const errors = await verifyIntegrity(manifest);
  let previous;
  let predecessor = '';
  try {
    predecessor = execFileSync(
      'git',
      ['log', '-1', '--format=%H', 'HEAD^', '--', 'constitutional-guard/manifest/history.json'],
      {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    ).trim();
    if (!predecessor) throw new Error('No historical predecessor');
    // A deletion commit is still part of the lineage; stepping to its parent
    // prevents removing and recreating the registry from resetting history.
    let predecessorManifest;
    try {
      predecessorManifest = execFileSync(
        'git',
        ['show', `${predecessor}:constitutional-guard/manifest/history.json`],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
    } catch {
      predecessorManifest = execFileSync(
        'git',
        ['show', `${predecessor}^:constitutional-guard/manifest/history.json`],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
    }
    previous = JSON.parse(predecessorManifest);
  } catch {
    if (predecessor) errors.push('Historical predecessor could not be verified');
    /* Only the actual initial adoption has no historical predecessor. */
  }
  if (previous) {
    for (const original of previous.entries) {
      const current = manifest.entries.find((row) => row.id === original.id);
      if (
        !current ||
        ['path', 'sha256', 'phase'].some((field) => current[field] !== original[field]) ||
        JSON.stringify(current.cases) !== JSON.stringify(original.cases)
      )
        errors.push(`Historical record removed/rewritten: ${original.id}`);
    }
    const changed = previous.protectedDependencies.filter(
      (original) =>
        manifest.protectedDependencies.find((row) => row.path === original.path)?.sha256 !==
        original.sha256,
    );
    if (changed.length) {
      let control;
      try {
        control = await readJson(path.join(root, manifest.controlChange));
      } catch {
        errors.push('Protected control change lacks a reviewed record');
      }
      for (const original of changed)
        if (
          !control?.changes?.some(
            (row) =>
              row.path === original.path &&
              row.before === original.sha256 &&
              row.after ===
                manifest.protectedDependencies.find(
                  (dependency) => dependency.path === original.path,
                )?.sha256,
          ) ||
          !control?.reviewers?.length ||
          control.reviewers.some(
            (reviewer) => typeof reviewer !== 'string' || reviewer.trim().length < 2,
          ) ||
          !Number.isFinite(Date.parse(control.date)) ||
          Date.parse(control.date) > Date.now() ||
          control.status !== 'reviewed'
        )
          errors.push(`Unapproved protected dependency change: ${original.path}`);
    }
  }
  return errors;
}
