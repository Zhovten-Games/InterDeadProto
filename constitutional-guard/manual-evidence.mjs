import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, readJson } from '../build/lib.mjs';
import { execFileSync } from 'node:child_process';
import Ajv from '../proto-dev/node_modules/ajv/dist/2020.js';

export async function validateEvidence(evidence, matrix, identity, now = new Date()) {
  const schema = await readJson(
    path.join(root, 'constitutional-guard/schemas/manual-evidence.schema.json'),
  );
  const validate = new Ajv({ allErrors: true, strict: true }).compile(schema);
  const errors = [];
  if (!validate(evidence)) return { errors: [JSON.stringify(validate.errors)], results: [] };
  const seen = new Set();
  for (const record of evidence.results) {
    const definition = matrix.find((row) => row.id === record.caseId);
    if (!definition || seen.has(record.caseId))
      errors.push(`Unknown/duplicate manual case: ${record.caseId}`);
    seen.add(record.caseId);
    const date = Date.parse(record.date);
    if (
      Number.isFinite(date) &&
      new Date(date).toISOString().slice(0, 19) !== record.date.slice(0, 19)
    )
      errors.push(`Invalid calendar date: ${record.caseId}`);
    if (
      record.origins.some((origin) => {
        try {
          const url = new URL(origin);
          return !['http:', 'https:'].includes(url.protocol) || !!url.username || !!url.password;
        } catch {
          return true;
        }
      })
    )
      errors.push(`Invalid evidence origin: ${record.caseId}`);
    if (!Number.isFinite(date) || date > now.getTime() || now.getTime() - date > 30 * 86400000)
      errors.push(`Stale/future manual evidence: ${record.caseId}`);
    for (const field of ['sourceSha', 'artifactTreeSha256', 'zipSha256', 'buildId'])
      if (record[field] !== identity[field])
        errors.push(`Manual evidence ${field} mismatch: ${record.caseId}`);
    if (definition?.browser && record.browser.name !== definition.browser)
      errors.push(`Wrong browser evidence: ${record.caseId}`);
    if (
      definition?.origin &&
      !record.origins.some((origin) => {
        try {
          return (
            new URL(origin).hostname === definition.origin ||
            new URL(origin).hostname.endsWith(`.${definition.origin}`)
          );
        } catch {
          return false;
        }
      })
    )
      errors.push(`Wrong host evidence: ${record.caseId}`);
  }
  return { errors, results: evidence.results };
}

export async function manualGates(matrix, identity) {
  const file = process.env.IRON_WARDEN_MANUAL_EVIDENCE_FILE;
  if (!file)
    return matrix.map((row) => ({
      id: row.id,
      phase: 'manual',
      mandatory: true,
      status: 'manual evidence required',
      reason: 'IRON_WARDEN_MANUAL_EVIDENCE_FILE is not supplied',
    }));
  const relative = path.relative(root, path.resolve(file));
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) {
    const tracked = execFileSync('git', ['ls-files', '--', relative], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    const ignored = (() => {
      try {
        execFileSync('git', ['check-ignore', '--quiet', '--', relative], { cwd: root });
        return true;
      } catch {
        return false;
      }
    })();
    if (tracked || !ignored)
      return matrix.map((row) => ({
        id: row.id,
        phase: 'manual',
        mandatory: true,
        status: 'failed',
        reason: 'Manual evidence must be external or Git-ignored, never canonical tracked input',
      }));
  }
  let evidence;
  try {
    evidence = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    return matrix.map((row) => ({
      id: row.id,
      phase: 'manual',
      mandatory: true,
      status: 'failed',
      reason: `Unreadable evidence: ${error.message}`,
    }));
  }
  const validated = await validateEvidence(evidence, matrix, identity);
  if (validated.errors.length)
    return matrix.map((row) => ({
      id: row.id,
      phase: 'manual',
      mandatory: true,
      status: 'failed',
      reason: validated.errors.join('; '),
    }));
  return matrix.map((row) => {
    const record = validated.results.find((item) => item.caseId === row.id);
    return {
      id: row.id,
      phase: 'manual',
      mandatory: true,
      status: record?.result || 'manual evidence required',
      evidence: record || null,
      reason: record ? null : 'Required manual case missing',
    };
  });
}
