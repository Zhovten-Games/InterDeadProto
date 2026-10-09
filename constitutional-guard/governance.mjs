import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { root, readJson, hashFile, sourceIdentity } from '../build/lib.mjs';
export const normativeDocuments = [
  'governance/PROFILE.md',
  'governance/legislation/DEVELOPMENT.md',
  'governance/base-adoption.json',
  'governance/acts.json',
  'governance/waivers.json',
  'manifest/rule-checks.json',
  'manifest/technical-regulators.json',
  'manifest/dependencies.json',
  'LICENSE.md',
  'LICENSING-OVERRIDES.md',
];
export async function checkGovernance() {
  const errors = [];
  const profile = await readFile(path.join(root, 'governance/PROFILE.md'), 'utf8');
  for (let index = 1; index <= 18; index++)
    if (
      (profile.match(new RegExp(`^## P${String(index).padStart(2, '0')}\\.`, 'gm')) || [])
        .length !== 1
    )
      errors.push(`Missing/duplicate PROFILE P${index}`);
  const acts = await readJson(path.join(root, 'governance/acts.json'));
  const identity = await sourceIdentity();
  for (const [name, revision] of Object.entries(acts.pins))
    if (identity.pins[name] !== revision) errors.push(`Registry pin mismatch: ${name}`);
  const adoption = await readJson(path.join(root, 'governance/base-adoption.json'));
  const basis = await readFile(path.join(root, adoption.source), 'utf8');
  const originalIds = [...basis.matchAll(/^### (BASE-[A-Z]+(?:-[A-Z]+)?\d{2})\./gm)].map(
    (match) => match[1],
  );
  const declared = adoption.entries.map((entry) => entry.id);
  if (
    new Set(declared).size !== declared.length ||
    originalIds.some((id) => !declared.includes(id)) ||
    declared.some((id) => !originalIds.includes(id))
  )
    errors.push('BASE selection must explicitly classify every source rule');
  if (adoption.sourceRevision !== identity.pins['.code-constitution'])
    errors.push('BASE source revision mismatch');
  const development = await readFile(
    path.join(root, 'governance/legislation/DEVELOPMENT.md'),
    'utf8',
  );
  if (development !== (await readFile(path.join(root, 'DEVELOPMENT.md'), 'utf8')))
    errors.push('Root DEVELOPMENT mirror diverged');
  const checks = await readJson(path.join(root, 'manifest/rule-checks.json'));
  const sections = {
    P05: [
      'автор',
      'редактор',
      'эксперт',
      'организатор',
      'ратификатор',
      'удостоверяющий',
      'исполнитель',
    ],
    P08: ['компетенция', 'отвода', 'апелляции', 'восстановления'],
    P09: ['Runtime', 'tooling', 'governance', 'WARDEN'],
  };
  for (const [section, terms] of Object.entries(sections)) {
    const block = profile.split(`## ${section}.`)[1]?.split('\n## ')[0] || '';
    for (const term of terms)
      if (!block.toLowerCase().includes(term.toLowerCase()))
        errors.push(`Incomplete founding ${section}: ${term}`);
  }
  const gateIds = new Set(
    (await readJson(path.join(root, 'constitutional-guard/manifest/gates.json'))).gates.map(
      (gate) => gate.id,
    ),
  );
  for (const mapping of checks.entries)
    for (const check of mapping.checks || [])
      if (!gateIds.has(check))
        errors.push(`Unregistered normative check: ${mapping.ruleId} → ${check}`);
  for (const selection of adoption.entries) {
    if (selection.status === 'not-adopted') continue;
    const mapping = checks.entries.filter((entry) => entry.ruleId === selection.id);
    if (
      mapping.length !== 1 ||
      mapping[0].revision !== adoption.sourceRevision ||
      !mapping[0].checks?.length ||
      !mapping[0].humanReview
    )
      errors.push(`Incomplete BASE rule/check and substantive review map: ${selection.id}`);
  }
  const regulators = await readJson(path.join(root, 'manifest/technical-regulators.json'));
  for (const record of regulators.entries) {
    for (const field of [
      'basis',
      'kind',
      'effect',
      'scope',
      'participants',
      'owner',
      'configurationPaths',
      'defaults',
      'observation',
      'changeProcedure',
      'contestation',
      'disabling',
    ]) {
      if (!record[field] || (Array.isArray(record[field]) && !record[field].length))
        errors.push(`Incomplete technical regulator ${record.id}: ${field}`);
    }
    for (const file of record.configurationPaths || []) {
      try {
        await access(path.join(root, file));
      } catch {
        errors.push(`Missing regulator configuration: ${file}`);
      }
    }
  }
  const dependencies = await readJson(path.join(root, 'manifest/dependencies.json'));
  const declaredStatus = acts.profile.status;
  const profileStatus = profile.match(/Status:\s*`(candidate|operative)`/)?.[1];
  const developmentStatus = development.match(/^Status:\s*`(candidate|operative)`/m)?.[1];
  if (
    profileStatus !== declaredStatus ||
    developmentStatus !== declaredStatus ||
    adoption.status !== declaredStatus ||
    dependencies.status !== declaredStatus ||
    acts.acts.some((act) => act.status !== declaredStatus) ||
    regulators.entries.some((record) => record.status !== declaredStatus)
  )
    errors.push(
      'Candidate/operative labels and normative registries must agree in the same change',
    );
  const packageJson = await readJson(path.join(root, 'proto-dev/package.json'));
  for (const [name, version] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    const records = dependencies.entries.filter(
      (entry) => entry.name === name && entry.version === version,
    );
    if (
      records.length !== 1 ||
      ['function', 'scope', 'status', 'source', 'license', 'supportedLine', 'reason', 'risks'].some(
        (field) => !records[0]?.[field],
      )
    )
      errors.push(`Incomplete direct dependency adoption record: ${name}@${version}`);
  }
  for (const rule of acts.acts.flatMap((act) => act.rules)) {
    if (!development.includes(rule)) errors.push(`Missing local rule: ${rule}`);
    const mapping = checks.entries.filter((entry) => entry.ruleId === rule);
    if (mapping.length !== 1 || !mapping[0].checks?.length)
      errors.push(`Missing concrete rule/check map: ${rule}`);
  }
  for (const document of normativeDocuments) await access(path.join(root, document));
  return {
    status: errors.length ? 'failed' : 'passed',
    errors,
    profileRevision: acts.profile.revision,
    actRevisions: acts.acts.map((act) => ({
      id: act.id,
      revision: act.revision,
      status: act.status,
    })),
  };
}

export async function checkRatification() {
  let evidence;
  try {
    evidence = await readJson(path.join(root, 'governance/attestations/ratification.json'));
  } catch {
    return {
      status: 'pending',
      reason: 'Candidate governance package requires competent human ratification',
    };
  }
  const profile = await readFile(path.join(root, 'governance/PROFILE.md'), 'utf8');
  const acts = await readJson(path.join(root, 'governance/acts.json'));
  const errors = [];
  if (
    profile.includes('UNRESOLVED') ||
    acts.profile.status !== 'operative' ||
    acts.acts.some((act) => act.status !== 'operative')
  )
    errors.push('PROFILE authorities/procedure and operative registry are incomplete');
  if (
    evidence.schemaVersion !== 1 ||
    evidence.status !== 'operative' ||
    !evidence.decision ||
    !Array.isArray(evidence.reviewers) ||
    !evidence.reviewers.length ||
    evidence.reviewers.some((name) => typeof name !== 'string' || name.trim().length < 2)
  )
    errors.push('Invalid ratification decision/reviewers');
  const date = Date.parse(evidence.date);
  if (!Number.isFinite(date) || date > Date.now()) errors.push('Invalid ratification date');
  for (const document of normativeDocuments)
    if (evidence.documents?.[document] !== (await hashFile(path.join(root, document))))
      errors.push(`Ratification hash mismatch: ${document}`);
  if (!/^governance\/decisions\/[a-zA-Z0-9._-]+\.(md|json)$/.test(evidence.decision || ''))
    errors.push('Invalid ratification decision path');
  try {
    await access(path.join(root, evidence.decision));
  } catch {
    errors.push('Ratification decision unavailable');
  }
  return {
    status: errors.length ? 'failed' : 'passed',
    reason: errors.join('; ') || null,
    evidence,
  };
}
