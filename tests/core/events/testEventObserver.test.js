import assert from 'assert';
import EventObserver from '../../../src/core/events/EventObserver.js';

describe('EventObserver', () => {
  it('enforces overriding of hooks', () => {
    const obs = new EventObserver();
    assert.throws(() => obs.onStart({}), /onStart/);
    assert.throws(() => obs.onComplete({}), /onComplete/);
  });

  it('allows subclasses to handle events', () => {
    class MyObserver extends EventObserver {
      onStart(evt) { this.started = evt; }
      onComplete(evt) { this.finished = evt; }
    }
    const o = new MyObserver();
    o.onStart({ id: 1 });
    o.onComplete({ id: 2 });
    assert.deepStrictEqual(o.started, { id: 1 });
    assert.deepStrictEqual(o.finished, { id: 2 });
  });
});
