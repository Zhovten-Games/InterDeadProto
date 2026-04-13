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
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  emit(evt) {
    this.emitted.push(evt);
    this.handlers.slice().forEach((handler) => handler(evt));
  }
}

describe('ResetService', () => {
  let bus;
  let database;
  let storage;
  let config;
  let logger;
  let service;
  let buttonStateRuntime;
  let buttonVisibilityRuntime;
  let dialogHistoryRuntime;

  beforeEach(() => {
    bus = new StubBus();
    database = {
      clearAllCalls: 0,
      async clearAll() {
        this.clearAllCalls++;
      },
    };
    storage = {
      cleared: false,
      clear() {
        this.cleared = true;
      },
    };
    config = { reset: { initialScreen: 'welcome', clearDatabase: true, clearStorage: true } };
    logger = {
      errors: [],
      error(msg) {
        this.errors.push(msg);
      },
    };
    buttonStateRuntime = {
      calls: [],
      clearUserRuntimeContext(opts) {
        this.calls.push(opts);
      },
    };
    buttonVisibilityRuntime = {
      calls: [],
      clearUserRuntimeContext(opts) {
        this.calls.push(opts);
      },
    };
    dialogHistoryRuntime = {
      calls: [],
      clearUserRuntimeContext(opts) {
        this.calls.push(opts);
      },
    };
    service = new ResetService(config, database, storage, bus, logger, [
      buttonStateRuntime,
      buttonVisibilityRuntime,
      dialogHistoryRuntime,
    ]);
    service.boot();
  });

  afterEach(() => {
    service.dispose();
  });

  it('clears persistence, database and navigates to configured screen', async () => {
    bus.emit({ type: APP_RESET_REQUESTED });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(database.clearAllCalls, 1, 'database cleared');
    assert.strictEqual(storage.cleared, true, 'storage cleared');
    assert.deepStrictEqual(buttonStateRuntime.calls, [{ clearPersisted: true }]);
    assert.deepStrictEqual(buttonVisibilityRuntime.calls, [{ clearPersisted: true }]);
    assert.deepStrictEqual(dialogHistoryRuntime.calls, [{ clearPersisted: true }]);

    const resetEvent = bus.emitted.find((evt) => evt.type === APP_RESET_COMPLETED);
    assert.ok(resetEvent, 'reset completion event emitted');
    assert.deepStrictEqual(resetEvent.payload.options, config.reset, 'uses default options');

    const screenEvent = bus.emitted.find((evt) => evt.type === 'SCREEN_CHANGE');
    assert.ok(screenEvent, 'screen change emitted');
    assert.strictEqual(screenEvent.screen, 'welcome');
    assert.deepStrictEqual(screenEvent.options, { force: true });
  });

  it('respects payload overrides and skips clearing when disabled', async () => {
    const options = { initialScreen: 'registration', clearDatabase: false, clearStorage: false };
    bus.emit({ type: APP_RESET_REQUESTED, payload: { options } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.strictEqual(database.clearAllCalls, 0, 'database not cleared when disabled');
    assert.strictEqual(storage.cleared, false, 'storage not cleared when disabled');

    const resetEvent = bus.emitted.find((evt) => evt.type === APP_RESET_COMPLETED);
    assert.ok(resetEvent, 'reset completion event emitted');
    assert.deepStrictEqual(resetEvent.payload.options, options);

    const screenEvent = bus.emitted.find((evt) => evt.type === 'SCREEN_CHANGE');
    assert.ok(screenEvent, 'screen change emitted');
    assert.strictEqual(screenEvent.screen, 'registration');
  });

  it('passes clearPersisted=false to runtime hooks when storage wipe is disabled', async () => {
    const options = { clearDatabase: false, clearStorage: false, initialScreen: 'registration' };
    bus.emit({ type: APP_RESET_REQUESTED, payload: { options } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepStrictEqual(buttonStateRuntime.calls, [{ clearPersisted: false }]);
    assert.deepStrictEqual(buttonVisibilityRuntime.calls, [{ clearPersisted: false }]);
    assert.deepStrictEqual(dialogHistoryRuntime.calls, [{ clearPersisted: false }]);
  });

  it('unsubscribes from bus on dispose', () => {
    assert.strictEqual(bus.handlers.length > 0, true);
    service.dispose();
    assert.strictEqual(bus.handlers.length, 0);
  });
});
