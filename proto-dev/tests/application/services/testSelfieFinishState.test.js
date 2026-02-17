import assert from 'assert';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import StateService from '../../../src/application/services/StateService.js';

class DummyProfile { canProceed() { return true; } }
class DummyGeo { }
class DummyGhost { getCurrentGhost() { return { name: 'guide' }; } }
class DummyLogger { info() {} error() {} }

const profile = new DummyProfile();
const geo = new DummyGeo();
const ghost = new DummyGhost();
const logger = new DummyLogger();

const state = new StateService(profile, geo, ghost, new EventBusAdapter(), logger);

describe('Selfie finish button state', function() {
  it('enabled only after capture', async function() {
    await state.boot();
    let enabled = state.isButtonEnabled('registration-camera', 'finish');
    assert.strictEqual(enabled, false);
    state.markCaptured();
    enabled = state.isButtonEnabled('registration-camera', 'finish');
    assert.strictEqual(enabled, true);
    state.dispose();
  });
});
