import assert from 'assert';

describe('DialogManager.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/narrative-runtime/dialog/dialog-manager.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
