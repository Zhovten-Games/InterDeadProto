import path from 'node:path';
import { root, readJson } from './lib.mjs';
import { serve } from './serve.mjs';

/** Read-only contract probe shared by Local Build Lab and WARDEN postbuild. */
export async function httpSmoke(directory) {
  const mapping = await readJson(path.join(root, 'build/artifact-map.json'));
  const resources = [
    'index.html',
    'sw.js',
    'favicon.ico',
    'assets/libs/db/sql-wasm.wasm',
    'assets/libs/tf.min.js',
    'assets/libs/coco-ssd.min.js',
    'assets/models/coco-ssd/model.json',
    ...mapping.templates.map((row) => row.publicPath),
  ];
  for (const locale of ['en', 'ru', 'uk', 'ja'])
    for (const domain of ['common', 'ui', 'loader', 'ghosts'])
      resources.push(`${mapping.locales.publicPath}/${locale}/${domain}.json`);
  for (const prefix of ['/', '/interdead/']) {
    const server = await serve(directory, { prefix });
    try {
      const base = `http://127.0.0.1:${server.address().port}${prefix}`;
      for (const resource of resources) {
        const response = await fetch(base + resource);
        if (!response.ok) throw new Error(`${prefix}${resource}: HTTP ${response.status}`);
        const expected = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.json': 'application/json',
          '.wasm': 'application/wasm',
        }[path.extname(resource)];
        if (expected && !response.headers.get('content-type')?.startsWith(expected))
          throw new Error(`${resource}: incorrect MIME`);
        if (resource.endsWith('.json')) await response.json();
        else await response.arrayBuffer();
      }
      if ((await fetch(base + 'src/presentation/templates/does-not-exist.html')).status !== 404)
        throw new Error('Missing template became an HTML fallback');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
  return { roots: ['/', '/interdead/'], resourcesPerRoot: resources.length };
}
