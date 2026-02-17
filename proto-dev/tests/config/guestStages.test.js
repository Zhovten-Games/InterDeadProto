import assert from 'assert';
import guest1 from '../../src/config/spirits/guest1.js';

describe('guest stage configurations', () => {
  it('guest1 has two event-quest pairs', () => {
    assert.strictEqual(guest1.stages.length, 3);
    const questStages = guest1.stages.filter(s => s.quest).length;
    assert.strictEqual(questStages, 2);
  });
});
