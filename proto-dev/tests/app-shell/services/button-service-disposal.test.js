// Ensures ButtonService cleans up its EventBus subscription on disposal.
import assert from 'assert';
import ButtonService from '../../../src/app-shell/controls/button-service.js';

class DummyBus {
  constructor() {
    this.subscribers = [];
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((f) => f !== fn);
  }
}

describe('ButtonService', () => {
  it('owns one subscription between boot and dispose', async () => {
    const bus = new DummyBus();
    const template = {};
    const language = { setLanguage() {} };
    const profile = { db: { clearAll: async () => {} }, setName() {}, canProceed: () => true };
    const svc = new ButtonService(template, language, profile, bus);
    assert.strictEqual(bus.subscribers.length, 0);
    await svc.boot();
    await svc.boot();
    assert.strictEqual(bus.subscribers.length, 1);
    svc.dispose();
    svc.dispose();
    assert.strictEqual(bus.subscribers.length, 0);
    await svc.boot();
    assert.strictEqual(bus.subscribers.length, 1);
    svc.dispose();
  });
});
