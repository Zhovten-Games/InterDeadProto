import assert from 'assert';

describe('controls.config.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../src/app-shell/controls/controls-config.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
