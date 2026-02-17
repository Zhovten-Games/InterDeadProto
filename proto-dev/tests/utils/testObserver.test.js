import assert from 'assert';
import Observer from '../../src/utils/Observer.js';

describe('Observer.js', () => {
  it('invokes subscribed handlers on emit', () => {
    const obs = new Observer();
    let called = false;
    const handler = evt => {
      called = evt === 'ping';
    };
    obs.subscribe(handler);
    obs.emit('ping');
    assert.ok(called, 'handler should be called with emitted value');
  });

  it('removes handlers via unsubscribe', () => {
    const obs = new Observer();
    const handler = () => {
      throw new Error('should not be called');
    };
    obs.subscribe(handler);
    obs.unsubscribe(handler);
    assert.doesNotThrow(() => obs.emit('test'));
  });

  it('continues emitting when a handler throws', () => {
    const obs = new Observer();
    let called = false;
    obs.subscribe(() => {
      throw new Error('boom');
    });
    obs.subscribe(() => {
      called = true;
    });
    assert.doesNotThrow(() => obs.emit('go'));
    assert.ok(called, 'subsequent handler should still be called');
  });
});
