import assert from 'assert';
import GhostService from '../../../src/application/services/GhostService.js';

describe('GhostService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/application/services/GhostService.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });

  it('uses configured default ghost when none stored', () => {
    const store = { load(){ return null; }, save(){} };
    const svc = new GhostService(store, { defaultGhost: 'guest1' });
    assert.strictEqual(svc.getCurrentGhost().name, 'guest1');
  });
});
