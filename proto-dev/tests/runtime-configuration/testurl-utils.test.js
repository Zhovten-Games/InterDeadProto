import assert from 'assert';

describe('urlUtils.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../src/asset-delivery/paths/url-utils.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
