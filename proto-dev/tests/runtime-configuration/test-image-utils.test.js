import assert from 'assert';

describe('ImageUtils.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../src/media/images/image-utils.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
