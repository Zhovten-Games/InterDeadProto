import assert from 'assert';
import GhostService from '../../../src/spirit-contacts/application/ghost-service.js';

describe('GhostService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/spirit-contacts/application/ghost-service.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });

  it('uses configured default ghost when none stored', () => {
    const store = {
      load() {
        return null;
      },
      save() {},
    };
    const svc = new GhostService(store, { defaultGhost: 'guest1' });
    assert.strictEqual(svc.getCurrentGhost().name, 'guest1');
  });
});
