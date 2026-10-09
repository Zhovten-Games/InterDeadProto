import assert from 'assert';

describe('Quest.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/quests/domain/quest.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
