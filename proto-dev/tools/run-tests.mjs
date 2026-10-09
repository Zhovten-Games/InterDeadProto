import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const project = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = path.dirname(project);
export async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(name)));
    else if (entry.name.endsWith('.test.js')) files.push(name);
  }
  return files;
}
const files = await collect(path.join(project, 'tests'));
if (files.length === 0) throw new Error('Empty test collection');
const registry = JSON.parse(await readFile(path.join(root, 'manifest/test-corpus.json'), 'utf8'));
const relative = files.map((file) => path.relative(root, file).split(path.sep).join('/'));
const registered = registry.active.map((entry) => entry.path).sort();
if (JSON.stringify([...relative].sort()) !== JSON.stringify(registered)) {
  throw new Error('Test collection differs from manifest/test-corpus.json');
}
const results = [];
let cursor = 0;
async function worker() {
  while (cursor < files.length) {
    const file = files[cursor++];
    const content = await readFile(file, 'utf8');
    if (/\b(?:describe|it|test)\s*\.\s*(?:only|skip)\s*\(/.test(content)) {
      results.push({
        file: path.relative(root, file),
        status: 'failed',
        reason: 'focused/skipped test',
      });
      continue;
    }
    const nodeTest = /from\s+['"]node:test['"]/.test(content);
    const args = nodeTest
      ? ['--unhandled-rejections=strict', '--test', '--test-reporter=tap', file]
      : [
          '--unhandled-rejections=strict',
          path.join(project, 'node_modules/mocha/bin/mocha.js'),
          '--require',
          path.join(project, 'tools/test-environment.cjs'),
          '--timeout',
          '10000',
          '--forbid-only',
          '--forbid-pending',
          '--exit',
          '--reporter',
          'json',
          file,
        ];
    const result = await new Promise((resolve) => {
      const child = spawn(process.execPath, args, {
        cwd: project,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '',
        stderr = '',
        expired = false;
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
      const timer = setTimeout(() => {
        expired = true;
        child.kill('SIGKILL');
      }, 25000);
      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({ status: 'unavailable', reason: error.message });
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        let count = 0,
          pending = 0;
        try {
          if (nodeTest) {
            count = Number(stdout.match(/# tests (\d+)/)?.[1] || 0);
            pending = Number(stdout.match(/# skipped (\d+)/)?.[1] || 0);
          } else {
            const start = stdout.indexOf('{\n  "stats"');
            const report = JSON.parse(stdout.slice(start));
            count = report.stats.tests;
            pending = report.stats.pending;
          }
        } catch {
          /* An invalid/missing report is a failed collection. */
        }
        resolve({
          status: code === 0 && count > 0 && pending === 0 ? 'passed' : 'failed',
          exitCode: code,
          tests: count,
          pending,
          reason: expired ? 'test process timeout' : null,
          stdout,
          stderr,
        });
      });
    });
    results.push({
      file: path.relative(root, file).split(path.sep).join('/'),
      runner: nodeTest ? 'node:test' : 'mocha',
      ...result,
    });
    if (result.status !== 'passed') process.stderr.write(`FAIL ${path.relative(project, file)}\n`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => a.file.localeCompare(b.file));
await mkdir(path.join(root, 'build/results'), { recursive: true });
await writeFile(
  path.join(root, 'build/results/unit-tests.json'),
  JSON.stringify({ schemaVersion: 1, collected: files.length, results }, null, 2) + '\n',
);
const failed = results.filter((result) => result.status !== 'passed');
process.stdout.write(
  `${results.length} files, ${results.reduce((sum, result) => sum + (result.tests || 0), 0)} tests, ${failed.length} failed files\n`,
);
process.exitCode = failed.length ? 1 : 0;
