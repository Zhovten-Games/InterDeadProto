import assert from 'assert';
import fs from 'fs';
import path from 'path';

const spiritsDir = new URL('../../src/config/spirits', import.meta.url);
const tempPath = path.join(spiritsDir.pathname, 'temp.js');

describe('config index auto-discovery', () => {
  before(() => {
    fs.writeFileSync(tempPath, 'export default { unlock: { requires: [] } };');
  });

  after(() => {
    fs.unlinkSync(tempPath);
  });

  it('detects new spirit files dynamically', async () => {
    delete global.window;
    delete global.document;
    const modUrl = new URL('../../src/config/index.js', import.meta.url);
    modUrl.search = `?t=${Date.now()}`;
    const mod = await import(modUrl.href);
    assert.ok(mod.spiritConfigs.temp);
  });
});
