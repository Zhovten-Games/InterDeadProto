import assert from 'assert';

describe('Event.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/runtime-events/domain/event.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
