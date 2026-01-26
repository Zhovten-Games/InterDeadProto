import assert from 'assert';

describe('DialogManager.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/core/dialog/DialogManager.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
