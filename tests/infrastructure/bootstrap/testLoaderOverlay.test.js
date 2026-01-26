import assert from 'assert';
import { JSDOM } from 'jsdom';
import Loader from '../../../src/infrastructure/bootstrap/Loader.js';
import LoaderView from '../../../src/presentation/widgets/LoaderView.js';
import Observer from '../../../src/utils/Observer.js';
import LanguageService from '../../../src/adapters/ui/LanguageAdapter.js';
import LocalizationAdapter from '../../../src/adapters/ui/LocalizationAdapter.js';
import path from 'path';

class DummyLogger { info(){} warn(){} error(){} }
class DummyStore {
  constructor(){ this.map = new Map(); }
  load(k){ return this.map.get(k); }
  save(k,v){ this.map.set(k,v); }
  remove(k){ this.map.delete(k); }
}
class StubBC {
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

describe('Loader overlay', function(){
  let dom;
  let loader;
  let bus;
  let view;
  let lang;

  beforeEach(async function(){
    dom = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });
    global.document = dom.window.document;
    global.window = dom.window;
    global.BroadcastChannel = StubBC;
    global.localStorage = dom.window.localStorage;
    global.sessionStorage = dom.window.sessionStorage;
    bus = new Observer();
    lang = new LanguageService(bus);
    lang.localization = new LocalizationAdapter(path.resolve('src/i18n/locales'));
    await lang.boot();
    view = new LoaderView(bus, lang);
    view.boot();
    loader = new Loader(new DummyLogger(), new DummyStore(), bus);
  });

  afterEach(function(){
    loader.channel.close();
    clearInterval(loader.heartbeat);
    view.dispose();
    lang.dispose();
    dom.window.close();
    delete global.document;
    delete global.window;
    delete global.localStorage;
    delete global.sessionStorage;
    delete global.BroadcastChannel;
  });

  it('updates list and hides only after BOOT_COMPLETE', async function(){
    await loader.load(async () => {
      bus.emit({ type: 'BOOT_STEP', name: 'DatabaseService' });
      bus.emit({ type: 'BOOT_STEP', name: 'CameraService' });
      const overlay = document.querySelector('.loader');
      const container = document.querySelector('[data-js="global-content"]');
      assert.ok(container.contains(overlay));
      assert.strictEqual(overlay.classList.contains('loader--visible'), true);
      bus.emit({ type: 'BOOT_COMPLETE' });
    });
    const overlay = document.querySelector('.loader');
    const items = overlay.querySelectorAll('.loader__list li');
    assert.strictEqual(items.length, 0);
    assert.strictEqual(overlay.classList.contains('loader--visible'), false);
    clearInterval(loader.heartbeat);
  });
});
