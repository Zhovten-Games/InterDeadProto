import path from 'node:path';
import { root, command } from './lib.mjs';
const targets = [
  'proto-dev/src',
  'proto-dev/tests',
  'proto-dev/tools',
  'build',
  'constitutional-guard',
  'eslint.config.mjs',
  'proto-dev/eslint.config.js',
  'proto-dev/vite.config.js',
  'proto-dev/vite.deploy.config.js',
  'proto-dev/sw.js',
];
const result = await command(
  process.execPath,
  [
    path.join(root, 'proto-dev/node_modules/eslint/bin/eslint.js'),
    '--config',
    path.join(root, 'eslint.config.mjs'),
    ...targets,
  ],
  { log: true },
);
process.exitCode = result.status === 'passed' ? 0 : 1;
