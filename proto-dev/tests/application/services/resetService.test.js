import assert from 'assert';
import ResetService from '../../../src/application/services/ResetService.js';
import { APP_RESET_REQUESTED, APP_RESET_COMPLETED } from '../../../src/core/events/constants.js';

class StubBus {
  constructor() {
    this.handlers = [];
    this.emitted = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.emitted.push(evt);
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('ResetService', () => {
  let bus;
  let database;
  let storage;
  let config;
  let logger;
  let service;

  beforeEach(() => {
    bus = new StubBus();
    database = { clearAllCalls: 0, async clearAll() { this.clearAllCalls++; } };
    storage = { cleared: false, clear() { this.cleared = true; } };
    config = { reset: { initialScreen: 'welcome', clearDatabase: true, clearStorage: true } };
    logger = { errors: [], error(msg) { this.errors.push(msg); } };
    service = new ResetService(config, database, storage, bus, logger);
    service.boot();
  });

  afterEach(() => {
    service.dispose();
  });

  it('clears persistence, database and navigates to configured screen', async () => {
    bus.emit({ type: APP_RESET_REQUESTED });
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(database.clearAllCalls, 1, 'database cleared');
    assert.strictEqual(storage.cleared, true, 'storage cleared');

    const resetEvent = bus.emitted.find(evt => evt.type === APP_RESET_COMPLETED);
    assert.ok(resetEvent, 'reset completion event emitted');
    assert.deepStrictEqual(resetEvent.payload.options, config.reset, 'uses default options');

    const screenEvent = bus.emitted.find(evt => evt.type === 'SCREEN_CHANGE');
    assert.ok(screenEvent, 'screen change emitted');
    assert.strictEqual(screenEvent.screen, 'welcome');
    assert.deepStrictEqual(screenEvent.options, { force: true });
  });

  it('respects payload overrides and skips clearing when disabled', async () => {
    const options = { initialScreen: 'registration', clearDatabase: false, clearStorage: false };
    bus.emit({ type: APP_RESET_REQUESTED, payload: { options } });
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(database.clearAllCalls, 0, 'database not cleared when disabled');
    assert.strictEqual(storage.cleared, false, 'storage not cleared when disabled');

    const resetEvent = bus.emitted.find(evt => evt.type === APP_RESET_COMPLETED);
    assert.ok(resetEvent, 'reset completion event emitted');
    assert.deepStrictEqual(resetEvent.payload.options, options);

    const screenEvent = bus.emitted.find(evt => evt.type === 'SCREEN_CHANGE');
    assert.ok(screenEvent, 'screen change emitted');
    assert.strictEqual(screenEvent.screen, 'registration');
  });

  it('unsubscribes from bus on dispose', () => {
    assert.strictEqual(bus.handlers.length > 0, true);
    service.dispose();
    assert.strictEqual(bus.handlers.length, 0);
  });
});
