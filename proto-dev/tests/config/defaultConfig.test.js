import assert from 'assert';
import config from '../../src/config/default.config.js';

describe('default.config', () => {
  it('contains a live fallback URL for COCO-SSD model', () => {
    const fallbackUrl = config?.ai?.cocoSsdFallbackUrl;
    assert.ok(typeof fallbackUrl === 'string' && fallbackUrl.length > 0);
    assert.match(fallbackUrl, /\/savedmodel\/.+\/model\.json$/);
  });
});
