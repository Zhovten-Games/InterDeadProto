import assert from 'assert';

describe('LanguageAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/localization/browser/language-adapter.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
