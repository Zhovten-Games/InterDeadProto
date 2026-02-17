import assert from 'assert';
import QuestObserver from '../../../src/core/quests/QuestObserver.js';

describe('QuestObserver', () => {
  it('throws when hooks are not overridden', () => {
    const obs = new QuestObserver();
    assert.throws(() => obs.onStart({}), /onStart/);
    assert.throws(() => obs.onComplete({}), /onComplete/);
  });

  it('propagates events to subclasses', () => {
    class MyObserver extends QuestObserver {
      onStart(evt) { this.started = evt; }
      onComplete(evt) { this.completed = evt; }
    }
    const o = new MyObserver();
    o.onStart({ id: 'q' });
    o.onComplete({ id: 'q' });
    assert.deepStrictEqual(o.started, { id: 'q' });
    assert.deepStrictEqual(o.completed, { id: 'q' });
  });
});
