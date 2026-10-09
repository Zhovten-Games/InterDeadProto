import assert from 'assert';

describe('index.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../src/app-shell/composition/configuration-index.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
