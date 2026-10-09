import assert from 'assert';

describe('VisualEffectsAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/app-shell/visual-effects/visual-effects-adapter.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
