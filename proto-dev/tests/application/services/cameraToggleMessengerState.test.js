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
    this.handlers = this.handlers.filter(h => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach(h => h(evt));
  }
}

describe('StateService camera toggle-messenger', () => {
  it('enables messenger toggle on camera screen', async () => {
    const profile = { canProceed: () => true };
    const geo = {};
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const bus = new Bus();
    const svc = new StateService(profile, geo, ghostService, bus, null);
    await svc.boot();

    assert.strictEqual(
      svc.isButtonEnabled('camera', 'toggle-messenger'),
      true
    );
    svc.dispose();
  });
});
