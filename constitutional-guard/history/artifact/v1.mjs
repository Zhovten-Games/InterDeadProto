import { assert, runDriver } from '../../driver-tools.mjs';
import { root, readJson, hashFile } from '../../../build/lib.mjs';
import { verifyFrozen } from '../../postbuild.mjs';
import { serve } from '../../../build/serve.mjs';
import path from 'node:path';

await runDriver(
  ['artifact.frozen-content', 'artifact.public-templates', 'artifact.unknown-resource'],
  async () => {
    const distribution = await readJson(path.join(root, 'build/results/distribution.json'));
    assert.equal(await verifyFrozen(distribution), true);
    const mapping = await readJson(path.join(root, 'build/artifact-map.json'));
    const server = await serve(path.join(root, distribution.distribution), { prefix: '/fixture/' });
    try {
      const base = `http://127.0.0.1:${server.address().port}/fixture/`;
      for (const template of mapping.templates) {
        assert.equal(
          await hashFile(path.join(root, template.source)),
          await hashFile(path.join(root, distribution.distribution, template.publicPath)),
        );
        const response = await fetch(base + template.publicPath);
        assert.equal(response.status, 200);
        assert.ok(response.headers.get('content-type').startsWith('text/html'));
      }
      assert.equal((await fetch(base + 'src/presentation/templates/absent.html')).status, 404);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  },
);
