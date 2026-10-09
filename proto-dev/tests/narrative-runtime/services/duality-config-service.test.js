import assert from 'assert';
import fs from 'fs/promises';
import DualityConfigService from '../../../src/narrative-runtime/configuration/duality-config-service.js';

describe('DualityConfigService', () => {
  it('loads stages via persistence adapter', async () => {
    const sample = JSON.parse(
      await fs.readFile('src/spirit-contacts/configuration/sample.json', 'utf-8'),
    );
    let requestedUrl = '';
    const adapter = {
      load: async (url) => {
        requestedUrl = url;
        return sample;
      },
    };
    const service = new DualityConfigService(adapter, 'src/spirit-contacts/configuration');
    const config = await service.load('sample');
    assert.strictEqual(requestedUrl, 'src/spirit-contacts/configuration/sample.json');
    assert.ok(Array.isArray(config.stages));
    assert.strictEqual(config.stages[0].event.id, 'start');
  });
});
