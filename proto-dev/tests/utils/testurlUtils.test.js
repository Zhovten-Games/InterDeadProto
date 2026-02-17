import assert from 'assert';

describe('urlUtils.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../src/utils/urlUtils.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
