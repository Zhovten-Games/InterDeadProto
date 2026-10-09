import globals from './proto-dev/node_modules/globals/index.js';

const correctness = {
  'constructor-super': 'error',
  'no-dupe-args': 'error',
  'no-dupe-class-members': 'error',
  'no-duplicate-case': 'error',
  'no-unexpected-multiline': 'error',
  'no-unreachable': 'error',
  'no-unsafe-finally': 'error',
  'valid-typeof': 'error',
  'no-undef': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-constant-condition': ['error', { checkLoops: false }],
};
export default [
  {
    ignores: [
      'build/workspace/**',
      'build/output/**',
      'build/results/**',
      'constitutional-guard/.fixtures/**',
      'proto-dev/assets/**',
      'proto-dev/dist/**',
      '**/node_modules/**',
      'proto-dev/tests/fixtures/external/**',
      'constitutional-guard/archive/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.worker,
        ...globals.mocha,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: correctness,
  },
  {
    files: [
      'proto-dev/src/**/*.js',
      'build/**/*.mjs',
      'constitutional-guard/**/*.mjs',
      'proto-dev/tools/**/*.mjs',
    ],
    rules: {
      'no-nested-ternary': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', args: 'none', caughtErrors: 'none' }],
    },
  },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
];
