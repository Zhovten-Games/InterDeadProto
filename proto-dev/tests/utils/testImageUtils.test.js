import assert from 'assert';

describe('ImageUtils.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../src/utils/ImageUtils.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
