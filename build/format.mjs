import { root, command } from './lib.mjs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const names = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(
    (name) =>
      /\.(?:js|mjs|cjs|json|md|html|ya?ml)$/.test(name) &&
      !/^\.code-constitution|^\.licensing-policy|^proto-dev\/assets\/|^constitutional-guard\/archive\/|^proto-dev\/tests\/fixtures\/external\//.test(
        name,
      ),
  );
const result = await command(
  process.execPath,
  [
    path.join(root, 'proto-dev/node_modules/prettier/bin/prettier.cjs'),
    process.argv.includes('--write') ? '--write' : '--check',
    ...names,
  ],
  { log: true },
);
process.exitCode = result.status === 'passed' ? 0 : 1;
