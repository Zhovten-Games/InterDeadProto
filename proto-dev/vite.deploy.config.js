import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config.js';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const sourceAdapter = path.resolve(rootDir, 'src/localization/adapters/localization-adapter.js');
const deployAdapter = path.resolve(
  rootDir,
  'tests/local-build-lab/overrides/localization-adapter.deploy.js',
);

const deployLocalizationAdapterPlugin = {
  name: 'deploy-localization-adapter',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!importer || source.startsWith('\0')) {
      return null;
    }

    const resolvedPath = path.resolve(path.dirname(importer), source);
    if (resolvedPath === sourceAdapter) {
      return deployAdapter;
    }

    return null;
  },
};

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [deployLocalizationAdapterPlugin],
    build: { sourcemap: false, target: 'es2022' },
  }),
);
