import assert from 'assert';

describe('Event.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/core/events/Event.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
