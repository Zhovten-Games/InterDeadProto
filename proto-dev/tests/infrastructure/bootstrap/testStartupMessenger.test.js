import assert from 'assert';
import { JSDOM } from 'jsdom';
import EventBusAdapter from '../../../src/adapters/logging/EventBusAdapter.js';
import EventBusFactory from '../../../src/infrastructure/factories/EventBusFactory.js';

class StubBC {
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

describe('startup messenger screen', function() {
  let originalBootAll;
  let dom;
  let BootManagerModule;
  let originalFactoryCreate;
  let bus;

  beforeEach(async function() {
    dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = {
      getItem: key => {
        if (key === 'userId') return '42';
        if (key === 'captured') return 'true';
        return null;
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    };
    global.sessionStorage = dom.window.sessionStorage;
    global.BroadcastChannel = StubBC;
    bus = new EventBusAdapter();
    originalFactoryCreate = EventBusFactory.prototype.create;
    EventBusFactory.prototype.create = function create() {
      return bus;
    };
    BootManagerModule = await import('../../../src/infrastructure/bootstrap/BootManager.js');
    originalBootAll = BootManagerModule.default.prototype.bootAll;
    BootManagerModule.default.prototype.bootAll = async function() {};
  });

  afterEach(function() {
    BootManagerModule.default.prototype.bootAll = originalBootAll;
    EventBusFactory.prototype.create = originalFactoryCreate;
    bus = null;
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.sessionStorage;
    delete global.BroadcastChannel;
  });

  it('emits messenger screen when user exists', async function() {
    const events = [];
    const handler = evt => {
      if (evt.type === 'SCREEN_CHANGE') events.push(evt);
    };
    bus.subscribe(handler);
    await import(`../../../src/infrastructure/bootstrap/index.js?test=${Date.now()}`);
    await new Promise(res => setTimeout(res, 20));
    bus.unsubscribe(handler);
    assert.strictEqual(events[0]?.screen, 'messenger');
  });
});
