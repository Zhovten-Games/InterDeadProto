import { readFile, readdir, stat, lstat, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const hashFile = async (file) => sha256(await readFile(file));
export const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
export const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

/** Serial, explicit copying avoids aliases/races and refuses source symlinks. */
export async function copyTree(source, destination, { filter = () => true } = {}) {
  if (!filter(source)) return;
  const information = await lstat(source);
  if (information.isSymbolicLink()) throw new Error(`Symlink in declared copy input: ${source}`);
  if (information.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const entry of (await readdir(source)).sort()) {
      await copyTree(path.join(source, entry), path.join(destination, entry), { filter });
    }
  } else if (information.isFile()) {
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  } else throw new Error(`Unsupported copy input: ${source}`);
}
export async function tree(directory) {
  const files = [];
  async function visit(base) {
    for (const entry of (await readdir(base, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name, 'en'),
    )) {
      const file = path.join(base, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink in distribution: ${file}`);
      if (entry.isDirectory()) await visit(file);
      else
        files.push({
          path: path.relative(directory, file).split(path.sep).join('/'),
          sha256: await hashFile(file),
          bytes: (await stat(file)).size,
        });
    }
  }
  await visit(directory);
  files.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
  return { files, sha256: sha256(JSON.stringify(files)) };
}

export async function sourceIdentity() {
  const paths = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const files = [];
  for (const name of paths) {
    if (name === '.code-constitution' || name === '.licensing-policy') continue;
    files.push({ path: name, sha256: await hashFile(path.join(root, name)) });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  const pins = {};
  for (const name of ['.code-constitution', '.licensing-policy']) {
    const expected = git('ls-tree', 'HEAD', name).match(/160000 commit ([a-f0-9]{40})/)?.[1];
    const actual = execFileSync('git', ['-C', path.join(root, name), 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
    if (!expected || expected !== actual) throw new Error(`Normative pin mismatch: ${name}`);
    if (
      execFileSync('git', ['-C', path.join(root, name), 'status', '--porcelain'], {
        encoding: 'utf8',
      }).trim()
    )
      throw new Error(`Dirty normative dependency: ${name}`);
    pins[name] = actual;
  }
  return {
    sourceSha: git('rev-parse', 'HEAD'),
    sourceTreeSha256: sha256(JSON.stringify({ files, pins })),
    pins,
    clean: !git('status', '--porcelain'),
  };
}

export function command(
  executable,
  args,
  { cwd = root, env = process.env, timeoutMs = 300000, log = false } = {},
) {
  return new Promise((resolve) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32' && executable === 'npm',
    });
    let stdout = '',
      stderr = '',
      expired = false;
    child.stdout.on('data', (data) => {
      stdout += data;
      if (log) process.stdout.write(data);
    });
    child.stderr.on('data', (data) => {
      stderr += data;
      if (log) process.stderr.write(data);
    });
    const timer = setTimeout(() => {
      expired = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ status: 'unavailable', reason: error.message, exitCode: null });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({
        status: exitCode === 0 ? 'passed' : 'failed',
        exitCode,
        stdout,
        stderr,
        reason: expired ? 'command timeout' : null,
      });
    });
  });
}
