import assert from 'assert';
import { JSDOM } from 'jsdom';
import Loader from '../../../src/infrastructure/bootstrap/Loader.js';
import Observer from '../../../src/utils/Observer.js';

class DummyStore {
  constructor() {
    this.data = new Map();
  }
  load(k) { return this.data.get(k); }
  save(k, v) { this.data.set(k, v); }
  remove(k) { this.data.delete(k); }
}

class DummyBC {
  constructor() { this.messages = []; }
  postMessage(m) { this.messages.push(m); }
  addEventListener() {}
}

class DummyLogger { constructor(){ this.errors = []; } info(){} warn(){} error(m){ this.errors.push(m); } }

describe('Loader.js', () => {
  let dom;
  beforeEach(() => {
    dom = new JSDOM('<body></body>', { url: 'http://localhost' });
    global.document = dom.window.document;
    global.window = dom.window;
    global.sessionStorage = dom.window.sessionStorage;
    global.BroadcastChannel = DummyBC;
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
    delete global.sessionStorage;
    delete global.BroadcastChannel;
  });

  it('broadcasts start and done and clears flag', async () => {
    const logger = new DummyLogger();
    const store = new DummyStore();
    const bus = new Observer();
    const loader = new Loader(logger, store, bus);
    const p = loader.load(async () => {
      bus.emit({ type: 'BOOT_COMPLETE' });
    });
    await p;
    const channel = loader.channel;
    assert.deepStrictEqual(channel.messages, ['start', 'done']);
    assert.strictEqual(store.load('appLoading'), undefined);
    clearInterval(loader.heartbeat);
  });
});
