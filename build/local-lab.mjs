import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { root, copyTree } from './lib.mjs';
import { assemble } from './assemble.mjs';
import { serve } from './serve.mjs';
import { httpSmoke } from './http-smoke.mjs';
const args = process.argv.slice(2);
const options = {
  diagnostic: true,
  localPackages: process.env.LOCAL_PACKAGES || null,
  localPackageArgs: [],
};
let smoke = false;
let preview = false,
  port = 4173,
  output = null;
const forwarded = new Set([
  '--local-packages-root',
  '--local-packages-workspace',
  '--local-packages-prepare-mode',
  '--local-package-map',
]);
const flags = new Set([
  '--skip-local-package-build',
  '--force-local-package-build',
  '--cleanup-local-packages-workspace',
]);
for (let index = 0; index < args.length; index++) {
  const name = args[index];
  if (name === '--serve') preview = true;
  else if (name === '--smoke') smoke = true;
  else if (name === '--port') port = Number(args[++index]);
  else if (name === '--output') output = path.resolve(args[++index]);
  else if (name === '--local-packages') options.localPackages = args[++index];
  else if (forwarded.has(name)) options.localPackageArgs.push(name, args[++index]);
  else if (flags.has(name)) options.localPackageArgs.push(name);
  else if (name === '--install-mode') {
    if (!['auto', 'ci'].includes(args[++index]))
      throw new Error('Reproducible assembly supports npm ci only');
  } else if (name === '--help') {
    process.stdout.write(
      'Local Build Lab: --smoke --serve --port 4173 --output <empty-directory> --local-packages all|name[,name] and existing scoped copy/link options. Uses build/assemble.mjs; diagnostic evidence cannot authorize publication.\n',
    );
    process.exit(0);
  } else throw new Error(`Unknown argument: ${name}`);
}
if (!Number.isSafeInteger(port) || port < 1 || port > 65535)
  throw new Error('Invalid preview port');
const result = await assemble(options);
let distribution = path.join(root, result.distribution);
if (output) {
  if (output === root || output.startsWith(path.join(root, 'proto-dev/src')))
    throw new Error('Output cannot replace canonical source');
  await mkdir(output, { recursive: true });
  const { readdir } = await import('node:fs/promises');
  if ((await readdir(output)).length) throw new Error('Custom output directory must be empty');
  await copyTree(distribution, output);
  distribution = output;
}
process.stdout.write(`Diagnostic assembly ${result.buildId}: ${result.artifactTreeSha256}\n`);
if (smoke) process.stdout.write(JSON.stringify(await httpSmoke(distribution)) + '\n');
if (preview) {
  const server = await serve(distribution, { port });
  process.stdout.write(`Preview: http://127.0.0.1:${server.address().port}/\n`);
  process.on('SIGINT', () => server.close());
  process.on('SIGTERM', () => server.close());
}
