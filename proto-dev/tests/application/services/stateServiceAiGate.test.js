import assert from 'assert';
import StateService from '../../../src/application/services/StateService.js';
import Observer from '../../../src/utils/Observer.js';

describe('StateService AI/local auth rules', () => {
  it('evaluates aiReady and localAuthReady rules', () => {
    const bus = new Observer();
    const profile = { canProceed: () => true };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const state = new StateService(profile, {}, ghostService, bus, { warn() {} });

    state.setLocalAuthReady(true);
    state.setAiState('READY');
    assert.strictEqual(state._evaluate({ type: 'localAuthReady' }), true);
    assert.strictEqual(state._evaluate({ type: 'aiReady' }), true);

    state.setLocalAuthReady(false);
    state.setAiState('FAILED');
    assert.strictEqual(state._evaluate({ type: 'localAuthReady' }), false);
    assert.strictEqual(state._evaluate({ type: 'aiReady' }), false);
  });
});
