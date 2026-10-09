import assert from 'assert';
import guest1 from '../../src/spirit-contacts/configuration/guest1.js';

describe('guest stage configurations', () => {
  it('guest1 has the declared six stages and five quest configurations', () => {
    assert.strictEqual(guest1.stages.length, 6);
    const questStages = guest1.stages.filter((s) => s.quest).length;
    assert.strictEqual(questStages, 5);
  });
});
