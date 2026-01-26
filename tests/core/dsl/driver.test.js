import assert from 'assert';
import Driver from '../../../src/core/dsl/driver.js';
import { StepTypes } from '../../../src/core/dsl/schema.js';
import reducer, { initialState } from '../../../src/core/engine/reducer.js';

describe('DSLDriver', () => {
  it('executes say -> await(user_post) -> quest(detection:person) -> say', () => {
    process.env.DSL_ENABLED = 'true';
    const steps = [
      { type: StepTypes.SAY, text: 'hi', author: 'ghost' },
      { type: StepTypes.AWAIT, kind: 'user_post' },
      { type: StepTypes.QUEST, target: 'person' },
      { type: StepTypes.SAY, text: 'bye', author: 'ghost' }
    ];
    const driver = new Driver(steps);
    let state = { ...initialState, dsl: { index: 0 } };

    let action = driver.tick(state);
    assert.strictEqual(action.type, 'DIALOG_POST');
    state = reducer(state, action).state;
    assert.strictEqual(state.dsl.index, 1);

    action = driver.tick(state);
    assert.strictEqual(action.type, 'AWAIT_USER');
    state = reducer(state, action).state;
    assert.strictEqual(state.dsl.index, 1);

    state = reducer(state, { type: 'DIALOG_POST' }).state;
    assert.strictEqual(state.dsl.index, 2);

    action = driver.tick(state);
    assert.strictEqual(action.type, 'QUEST_START');
    state = reducer(state, action).state;
    assert.strictEqual(state.dsl.index, 2);

    state = reducer(state, { type: 'DETECTION_FINISHED' }).state;
    assert.strictEqual(state.dsl.index, 3);

    action = driver.tick(state);
    assert.strictEqual(action.type, 'DIALOG_POST');
    state = reducer(state, action).state;
    assert.strictEqual(state.dsl.index, 4);

    action = driver.tick(state);
    assert.strictEqual(action, null);
    delete process.env.DSL_ENABLED;
  });
});
