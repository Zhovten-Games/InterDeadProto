import assert from 'assert';
import StateService from '../../../src/application/services/StateService.js';

class Bus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach((h) => h(evt));
  }
}

describe('StateService button enablement', () => {
  it('enables language change and profile import on welcome and registration', async () => {
    const profile = { canProceed: () => true };
    const geo = {};
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const bus = new Bus();
    const svc = new StateService(profile, geo, ghostService, bus, null);
    await svc.boot();

    assert.strictEqual(svc.isButtonEnabled('welcome', 'change-language'), true);
    assert.strictEqual(svc.isButtonEnabled('welcome', 'import-profile'), true);
    assert.strictEqual(svc.isButtonEnabled('registration', 'change-language'), true);
    assert.strictEqual(svc.isButtonEnabled('registration', 'import-profile'), true);
    assert.strictEqual(svc.isButtonEnabled('messenger', 'open-profile-settings'), true);
    assert.strictEqual(svc.isButtonEnabled('messenger', 'reset-account'), true);
  });
});

it('keeps AI runtime state on APP_RESET_COMPLETED', async () => {
  const profile = { canProceed: () => true };
  const geo = {};
  const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
  const bus = new Bus();
  const svc = new StateService(profile, geo, ghostService, bus, null);
  await svc.boot();

  svc.setAiState('READY');
  bus.emit({ type: 'APP_RESET_COMPLETED' });

  assert.strictEqual(svc.getAiState(), 'READY');
  assert.strictEqual(svc.isLocalAuthReady(), false);
});
