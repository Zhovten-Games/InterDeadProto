import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { root, command } from './lib.mjs';
const result = await command('npm', ['audit', '--json'], {
  cwd: path.join(root, 'proto-dev'),
  timeoutMs: 90000,
});
let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  throw new Error('Dependency audit unavailable: no valid registry report');
}
await mkdir(path.join(root, 'build/results'), { recursive: true });
await writeFile(
  path.join(root, 'build/results/dependency-audit.json'),
  JSON.stringify(report, null, 2) + '\n',
);
if (report.error || !report.metadata?.vulnerabilities)
  throw new Error('Dependency audit unavailable: registry/network failure');
const count = report.metadata.vulnerabilities.total;
process.stdout.write(`Locked dependency audit: ${count} vulnerabilities\n`);
process.exitCode = count > 0 || result.status !== 'passed' ? 1 : 0;
