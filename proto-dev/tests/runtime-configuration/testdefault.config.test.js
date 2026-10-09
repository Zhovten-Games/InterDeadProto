// Validates default configuration exports.
import assert from 'assert';

describe('default.config.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../src/app-shell/configuration/default-config.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });

  it('defines chatScrollStep', async () => {
    const cfg = (await import('../../src/app-shell/configuration/default-config.js')).default;
    assert.strictEqual(cfg.chatScrollStep, 100);
  });
});
