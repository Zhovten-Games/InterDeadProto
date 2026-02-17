// Tests for ErrorManager forwarding error events to the logger.
import assert from 'assert';
import ErrorManager from '../../../src/application/managers/ErrorManager.js';

describe('ErrorManager', () => {
  it('forwards error events to logger', () => {
    class Bus {
      constructor() { this.handlers = []; }
      subscribe(fn) { this.handlers.push(fn); }
      unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
      emit(evt) { this.handlers.slice().forEach(h => h(evt)); }
    }
    const bus = new Bus();
    const logger = { errors: [], error(msg) { this.errors.push(msg); } };
    const mgr = new ErrorManager(bus, logger);
    mgr.boot();
    bus.emit({ type: 'error', error: new Error('fail') });
    assert.ok(logger.errors.some(m => m.includes('fail')));
    mgr.dispose();
    assert.strictEqual(bus.handlers.length, 0);
  });
});
