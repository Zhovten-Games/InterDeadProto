import assert from 'assert';
import GhostSwitchService from '../../../src/application/services/GhostSwitchService.js';

describe('GhostSwitchService', () => {
  it('unlocks ghosts based on completion', () => {
    const store = { data: {}, save(k,v){ this.data[k]=v; }, load(k){ return this.data[k]; } };
    const svc = new GhostSwitchService(store);
    const configs = {
      guide: { unlock: { requires: [] } },
      spirit2: { unlock: { requires: ['guide'] } }
    };
    assert.deepStrictEqual(svc.getUnlocked(configs), ['guide']);
    svc.markCompleted('guide');
    assert.deepStrictEqual(svc.getUnlocked(configs).sort(), ['guide','spirit2']);
  });

  it('exposes available ghosts including always-visible entries and completion state', () => {
    const store = { data: {}, save(k,v){ this.data[k]=v; }, load(k){ return this.data[k]; } };
    const svc = new GhostSwitchService(store);
    const configs = {
      guide: { unlock: { requires: [] } },
      spirit2: { unlock: { requires: ['guide'], alwaysVisible: true } }
    };
    assert.strictEqual(svc.isCompleted('guide'), false);
    const initial = svc.getAvailable(configs, 'guide').sort();
    assert.deepStrictEqual(initial, ['guide', 'spirit2']);
    svc.markCompleted('guide', configs);
    assert.strictEqual(svc.isCompleted('guide'), true);
    const unlocked = svc.getAvailable(configs, 'spirit2').sort();
    assert.deepStrictEqual(unlocked, ['guide', 'spirit2']);
  });
});
