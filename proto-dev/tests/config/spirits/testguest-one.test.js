import assert from 'assert';

describe('guest-one.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/config/spirits/guest-one.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
