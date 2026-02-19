import assert from 'assert';
import DetectionAdapter from '../../../src/adapters/ai/DetectionAdapter.js';

describe('DetectionAdapter cache build URL mapping', () => {
  it('returns URL string for AI model Request input without creating a new Request', () => {
    const logger = { info() {}, warn() {}, error() {} };
    const adapter = new DetectionAdapter(logger);

    const input = new Request('https://example.com/assets/models/coco-ssd/model.json');
    const output = adapter._withCacheBuildParam(input);

    assert.strictEqual(typeof output, 'string');
    assert.ok(output.includes('/models/coco-ssd/model.json'));
    assert.ok(output.includes('v='));
  });

  it('does not rewrite non-AI URLs', () => {
    const logger = { info() {}, warn() {}, error() {} };
    const adapter = new DetectionAdapter(logger);

    const input = 'https://example.com/api/session';
    const output = adapter._withCacheBuildParam(input);

    assert.strictEqual(output, input);
  });
});
