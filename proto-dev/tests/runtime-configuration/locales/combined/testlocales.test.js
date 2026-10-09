import assert from 'assert';

describe('locales.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../../src/localization/locales/combined/locales.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
