import assert from 'assert';

describe('Dialog.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/narrative-runtime/dialog/dialog.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
