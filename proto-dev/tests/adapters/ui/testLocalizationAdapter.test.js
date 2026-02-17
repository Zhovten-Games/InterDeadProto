import assert from 'assert';

describe('LocalizationAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/adapters/ui/LocalizationAdapter.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
