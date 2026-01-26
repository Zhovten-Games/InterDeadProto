import assert from 'assert';
import Quest from '../../../src/core/quests/Quest.js';
import { QUEST_STARTED, QUEST_COMPLETED } from '../../../src/core/events/constants.js';

describe('Quest', () => {
  it('emits lifecycle events and persists state', () => {
    const emitted = [];
    const bus = { emit: e => emitted.push(e) };
    const store = { save: (k, v) => (store.saved = { k, v }) };
    const logs = [];
    const logger = { info: msg => logs.push(msg) };
    const quest = new Quest(bus, store, 'q1', logger);
    quest.start();
    quest.complete();
    assert.deepStrictEqual(emitted, [
      { type: QUEST_STARTED, id: 'q1' },
      { type: QUEST_COMPLETED, id: 'q1' }
    ]);
    assert.strictEqual(store.saved.k, 'quest:q1');
    const state = quest.serializeState();
    assert.strictEqual(state.completed, true);
    assert.deepStrictEqual(logs, ['Quest started: q1', 'Quest completed: q1']);
  });
});
