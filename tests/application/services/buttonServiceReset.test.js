import assert from 'assert';
import ButtonService from '../../../src/application/services/ButtonService.js';
import { APP_RESET_REQUESTED } from '../../../src/core/events/constants.js';

class DummyBus {
  constructor() {
    this.subscribers = [];
    this.events = [];
  }

  subscribe(handler) {
    this.subscribers.push(handler);
  }

  unsubscribe(handler) {
    this.subscribers = this.subscribers.filter(fn => fn !== handler);
  }

  emit(evt) {
    this.events.push(evt);
  }
}

const createService = bus => {
  const template = { render: async () => '', renderSection: async () => {} };
  const language = { setLanguage() {}, translate: async key => key, applyLanguage() {} };
  const profile = {
    db: {
      clearAll: async () => {
        throw new Error('reset should be delegated to ResetService');
      }
    },
    setName() {},
    canProceed: () => true
  };
  const storage = {
    clear: () => {
      throw new Error('storage clearing handled by ResetService');
    }
  };

  return new ButtonService(template, language, profile, bus, storage);
};

describe('ButtonService reset workflow', () => {
  it('emits APP_RESET_REQUESTED instead of forcing reload', async () => {
    const bus = new DummyBus();
    const service = createService(bus);

    await service.handleAction({ action: 'reset-account' });

    assert.strictEqual(bus.events.length, 1);
    assert.deepStrictEqual(bus.events[0], {
      type: APP_RESET_REQUESTED,
      payload: { source: 'button' }
    });
  });

  it('passes custom reset options through the event payload', async () => {
    const bus = new DummyBus();
    const service = createService(bus);
    const options = { clearDatabase: false, initialScreen: 'messenger' };

    await service.handleAction({ action: 'reset-account', value: options });

    assert.strictEqual(bus.events.length, 1);
    assert.deepStrictEqual(bus.events[0], {
      type: APP_RESET_REQUESTED,
      payload: { source: 'button', options }
    });
  });
});

