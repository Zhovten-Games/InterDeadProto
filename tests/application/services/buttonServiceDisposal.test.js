// Ensures ButtonService cleans up its EventBus subscription on disposal.
import assert from 'assert';
import ButtonService from '../../../src/application/services/ButtonService.js';

class DummyBus {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(f => f !== fn); }
}

describe('ButtonService', () => {
  it('unsubscribes from the bus when disposed', () => {
    const bus = new DummyBus();
    const template = {};
    const language = { setLanguage() {} };
    const profile = { db: { clearAll: async () => {} }, setName() {}, canProceed: () => true };
    const svc = new ButtonService(template, language, profile, bus);
    assert.strictEqual(bus.subscribers.length, 1);
    svc.dispose();
    assert.strictEqual(bus.subscribers.length, 0);
  });
});
