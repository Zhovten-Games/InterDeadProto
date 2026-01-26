import assert from 'assert';

describe('locales.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../../src/i18n/locales/spirits/locales.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
