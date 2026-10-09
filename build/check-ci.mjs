import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root } from './lib.mjs';

const require = createRequire(path.join(root, 'proto-dev/package.json'));
const yaml = require('js-yaml');
const workflow = yaml.load(
  await readFile(path.join(root, '.github/workflows/proto-pipeline.yml'), 'utf8'),
);
const errors = [];
const candidate = workflow.jobs?.candidate;
const condition =
  "github.event_name == 'push' && github.ref == 'refs/heads/main' && needs.candidate.outputs.release-status == 'passed'";
if (
  !candidate ||
  !workflow.on?.push?.branches?.includes('main') ||
  workflow.on.push.branches.includes('proto')
)
  errors.push('Source push trigger must include main and exclude generated proto');
for (const step of Object.values(workflow.jobs || {}).flatMap((job) => job.steps || [])) {
  if (step.uses && !/@[a-f0-9]{40}$/.test(step.uses)) errors.push(`Unpinned action: ${step.uses}`);
}
const steps = candidate?.steps || [];
if (!steps.some((step) => step.run === 'npm --prefix proto-dev run check'))
  errors.push('Candidate must execute the complete WARDEN check');
if (!steps.some((step) => step.run?.includes('node build/verify-release.mjs --candidate')))
  errors.push('Candidate automatic-gate consumption is missing');
const frozen = steps.find((step) => step.with?.name === 'idp-frozen-distribution');
if (
  frozen?.if !== 'success()' ||
  frozen.with.path !== 'build/output' ||
  frozen.with['include-hidden-files'] !== true
)
  errors.push('Candidate must upload the exact frozen tree including licensing files');
for (const id of ['deploy-proto', 'deploy-itch']) {
  const job = workflow.jobs?.[id];
  if (!job || job.needs !== 'candidate' || job.if !== condition)
    errors.push(`Publication trigger/verdict boundary changed: ${id}`);
  const releaseSteps = job?.steps || [];
  const consume = releaseSteps.findIndex((step) => step.run === 'node build/verify-release.mjs');
  if (consume < 0) errors.push(`Missing release consumption gate: ${id}`);
  for (const name of ['idp-frozen-distribution', 'idp-warden-evidence']) {
    if (
      !releaseSteps
        .slice(0, consume)
        .some(
          (step) => step.uses?.startsWith('actions/download-artifact@') && step.with?.name === name,
        )
    )
      errors.push(`Missing certified input before publication: ${id}/${name}`);
  }
  if (
    releaseSteps.some((step) =>
      /(?:run check|build:deploy|assemble\.mjs|local-lab\.mjs)/.test(step.run || ''),
    )
  )
    errors.push(`Publication job rebuilds the certified artifact: ${id}`);
  const publish = releaseSteps.findIndex(
    (step) => step.uses?.startsWith('JamesIves/') || step.run?.startsWith('butler push '),
  );
  if (publish <= consume) errors.push(`Publication precedes artifact verification: ${id}`);
}
const protoPublish = workflow.jobs?.['deploy-proto']?.steps.find((step) =>
  step.uses?.startsWith('JamesIves/'),
);
if (
  protoPublish?.with?.branch !== 'proto' ||
  protoPublish.with.folder !== 'build/output/dist' ||
  protoPublish.with.clean !== true
)
  errors.push('Generated proto publication path/cleanup contract changed');
if (
  !workflow.jobs?.['deploy-itch']?.steps.some(
    (step) => step.run === 'butler push build/output/dist zhovten-games/interdead:web',
  )
)
  errors.push('itch channel must consume the same distribution');
for (const error of errors) process.stderr.write(`${error}\n`);
process.stdout.write(`CI publication policy: ${errors.length} errors\n`);
process.exitCode = errors.length ? 1 : 0;
