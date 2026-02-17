import assert from 'assert';
import DialogHistoryObserverService from '../../../src/application/services/DialogHistoryObserverService.js';
import DialogManager from '../../../src/core/dialog/DialogManager.js';
import Dialog from '../../../src/core/dialog/Dialog.js';
import { EVENT_MESSAGE_READY } from '../../../src/core/events/constants.js';

/**
 * Verifies dialog history persists on each message without blocking flow
 * and restores after a reload.
 */
describe('DialogHistoryObserverService', () => {
  class MockBus {
    constructor() { this.handlers = []; }
    subscribe(fn) { this.handlers.push(fn); }
    unsubscribe(fn) { this.handlers = this.handlers.filter(h => h !== fn); }
    emit(evt) { this.handlers.slice().forEach(h => h(evt)); }
  }

  it('saves history asynchronously after each message', async () => {
    const bus = new MockBus();
    const store = [];
    const historyService = { append: (name, msgs) => store.push({ name, msgs: [...msgs] }) };
    const ghostService = { getCurrentGhost: () => ({ name: 'spirit' }) };
    const dialog = new Dialog([
      { author: 'ghost', text: 'hi' },
      { author: 'ghost', text: 'again' }
    ]);
    const manager = new DialogManager(dialog, bus, null, { isReady: () => true, setState() {} });
    const observer = new DialogHistoryObserverService(manager, historyService, ghostService, bus);
    observer.boot();

    manager.progress();
    assert.strictEqual(store.length, 0, 'append should be deferred');
    await Promise.resolve();
    assert.strictEqual(store[0].name, 'spirit');
    assert.strictEqual(store[0].msgs[0].text, 'hi');

    manager.progress();
    await Promise.resolve();
    assert.strictEqual(store[1].msgs[0].text, 'again');
    observer.dispose();
  });

  it('ignores replayed messages', async () => {
    const bus = new MockBus();
    const store = [];
    const historyService = { append: (_, msgs) => store.push(msgs) };
    const ghostService = { getCurrentGhost: () => ({ name: 'spirit' }) };
    const dialog = new Dialog([]);
    const manager = new DialogManager(dialog, bus, null, { isReady: () => true, setState() {} });
    const observer = new DialogHistoryObserverService(manager, historyService, ghostService, bus);
    observer.boot();

    const replayMsg = { text: 'hi', author: 'ghost' };
    bus.emit({ type: EVENT_MESSAGE_READY, replay: true, ...replayMsg, message: replayMsg });
    await Promise.resolve();
    assert.strictEqual(store.length, 0);
    observer.dispose();
  });

  it('restores saved history after reload', async () => {
    const bus = new MockBus();
    const persistence = {
      data: {},
      save(key, value) { this.data[key] = value; },
      load(key) { return this.data[key]; }
    };
    const historyService = {
      append: (name, msgs) => persistence.save(`dialogHistory:${name}`, msgs),
      load: name => persistence.load(`dialogHistory:${name}`) || []
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'spirit' }) };
    const dialog = new Dialog([{ author: 'ghost', text: 'hi' }]);
    const manager = new DialogManager(dialog, bus, null, { isReady: () => true, setState() {} });
    const observer = new DialogHistoryObserverService(manager, historyService, ghostService, bus);
    observer.boot();

    manager.progress();
    await Promise.resolve();
    observer.dispose();

    // Simulate reload with new manager
    const bus2 = new MockBus();
    const dialog2 = new Dialog([{ author: 'ghost', text: 'hi' }]);
    const manager2 = new DialogManager(dialog2, bus2, null, { isReady: () => true, setState() {} });
    const observer2 = new DialogHistoryObserverService(manager2, historyService, ghostService, bus2);
    observer2.boot();

      const history = historyService.load('spirit');
      manager2.dialog.restore(history.length);
      assert.strictEqual(manager2.dialog.index, 1);
      assert.strictEqual(history[0].text, 'hi');
      observer2.dispose();
    });

    it('appends image messages to history', async () => {
      const bus = new MockBus();
      const store = {};
      const historyService = {
        append: (name, msgs) => (store[name] = msgs),
        load: name => store[name] || []
      };
      const ghostService = { getCurrentGhost: () => ({ name: 'spirit' }) };
      const dialog = new Dialog([]);
      const manager = new DialogManager(dialog, bus, null, { isReady: () => true, setState() {} });
      const observer = new DialogHistoryObserverService(manager, historyService, ghostService, bus);
      observer.boot();

      const imgMsg = { type: 'image', src: 'data', author: 'user', avatar: 'a' };
      dialog.messages.splice(manager.dialog.index, 0, {
        ...imgMsg,
        id: manager.dialog.index,
        timestamp: Date.now()
      });
      manager.dialog.index++;
      const { type: _mt, ...restImg } = imgMsg;
      bus.emit({ type: EVENT_MESSAGE_READY, ...restImg, message: imgMsg });
      await Promise.resolve();
      assert.strictEqual(store.spirit.length, 1);
      assert.strictEqual(store.spirit[0].src, 'data');
      assert.strictEqual(store.spirit[0].type, 'image');
      assert.strictEqual(store.spirit[0].author, 'user');
      observer.dispose();
    });

    it('keeps image messages when dialog progresses later', async () => {
      const bus = new MockBus();
      const store = {};
      const historyService = {
        append: (name, msgs) => (store[name] = msgs),
        load: name => store[name] || []
      };
      const ghostService = { getCurrentGhost: () => ({ name: 'spirit' }) };
      const dialog = new Dialog([
        { author: 'ghost', text: 'hi' },
        { author: 'ghost', text: 'bye' }
      ]);
      const manager = new DialogManager(dialog, bus, null, { isReady: () => true, setState() {} });
      const observer = new DialogHistoryObserverService(manager, historyService, ghostService, bus);
      observer.boot();

      manager.progress();
      await Promise.resolve();
      const img = { type: 'image', src: 'data', author: 'user', avatar: 'a' };
      dialog.messages.splice(manager.dialog.index, 0, {
        ...img,
        id: manager.dialog.index,
        timestamp: Date.now()
      });
      manager.dialog.index++;
      const { type: _mt2, ...restImg2 } = img;
      bus.emit({ type: EVENT_MESSAGE_READY, ...restImg2, message: img });
      await Promise.resolve();
      manager.progress();
      await Promise.resolve();
      assert.strictEqual(store.spirit.length, 3);
      assert.strictEqual(store.spirit[1].src, 'data');
      assert.strictEqual(store.spirit[2].text, 'bye');
      observer.dispose();
    });
  });
