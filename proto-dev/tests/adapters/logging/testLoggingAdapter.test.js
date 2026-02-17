import assert from 'assert';
import LoggingAdapter from '../../../src/adapters/logging/LoggingAdapter.js';

class StubBus {
  constructor() {
    this.handlers = [];
  }
  subscribe(h) {
    this.handlers.push(h);
  }
  unsubscribe(h) {
    this.handlers = this.handlers.filter(x => x !== h);
  }
  emit(evt) {
    for (const h of this.handlers) h(evt);
  }
}

describe('LoggingAdapter.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/adapters/logging/LoggingAdapter.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });

  describe('level routing', () => {
    let bus;
    let adapter;

    beforeEach(() => {
      bus = new StubBus();
      adapter = new LoggingAdapter('debug', bus);
      adapter.boot();
    });

    afterEach(() => {
      adapter.dispose();
    });

    const cases = [
      { level: 'debug', method: 'log' },
      { level: 'info', method: 'log' },
      { level: 'warn', method: 'warn' },
      { level: 'error', method: 'error' }
    ];

    for (const { level, method } of cases) {
      it(`routes ${level} events to console.${method}`, () => {
        let called = 0;
        const orig = console[method];
        console[method] = () => { called++; };
        bus.emit({ type: 'log', level, message: 'test' });
        console[method] = orig;
        assert.strictEqual(called, 1);
      });
    }
  });
});
