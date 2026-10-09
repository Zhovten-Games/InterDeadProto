import assert from 'assert';

describe('DBPublisher.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/storage/publication/db-publisher.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
