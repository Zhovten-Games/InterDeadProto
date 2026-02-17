import assert from 'assert';
import reducer, { initialState } from '../../../src/core/engine/reducer.js';
import { replayHistory, dialogAdvance, awaitUser } from '../../../src/core/engine/actions.js';

describe('core engine reducer', () => {
  it('is idempotent for REPLAY_HISTORY', () => {
    const action = replayHistory({ dialog: { index: 2, awaiting: 'user' } });
    const first = reducer(initialState, action);
    const second = reducer(first.state, action);
    assert.strictEqual(second.state, first.state);
    assert.deepStrictEqual(second.effects, []);
  });

  it('translates awaiting from user to ghost on dialog advance', () => {
    const awaited = reducer(initialState, awaitUser()).state;
    const progressed = reducer(awaited, dialogAdvance()).state;
    assert.strictEqual(progressed.dialog.awaiting, 'ghost');
  });
});
