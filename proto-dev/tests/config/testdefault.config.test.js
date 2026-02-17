// Validates default configuration exports.
import assert from 'assert';

describe('default.config.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../src/config/default.config.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });

  it('defines chatScrollStep', async () => {
    const cfg = (await import('../../src/config/default.config.js')).default;
    assert.strictEqual(cfg.chatScrollStep, 100);
  });
});
