import assert from 'assert';

describe('guest1.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/spirit-contacts/configuration/guest1.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
