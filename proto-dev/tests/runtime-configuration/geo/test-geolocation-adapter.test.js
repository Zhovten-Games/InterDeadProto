import assert from 'assert';

describe('GeolocationAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/identity/browser/geolocation-adapter.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
