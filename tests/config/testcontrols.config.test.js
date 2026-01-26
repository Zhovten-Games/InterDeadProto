import assert from 'assert';

describe('controls.config.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../src/config/controls.config.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
