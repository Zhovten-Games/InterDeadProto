import assert from 'assert';

describe('CameraAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/camera/browser/camera-adapter.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
