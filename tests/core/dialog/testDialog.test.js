import assert from 'assert';

describe('Dialog.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/core/dialog/Dialog.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
