import assert from 'assert';
import { JSDOM } from 'jsdom';
import Loader from '../../../src/infrastructure/bootstrap/Loader.js';
import LoaderView from '../../../src/presentation/widgets/LoaderView.js';
import Observer from '../../../src/utils/Observer.js';
import LanguageService from '../../../src/adapters/ui/LanguageAdapter.js';
import LocalizationAdapter from '../../../src/adapters/ui/LocalizationAdapter.js';
import path from 'path';

class DummyStore {
  constructor() { this.data = new Map(); }
  load(k){ return this.data.get(k); }
  save(k,v){ this.data.set(k,v); }
  remove(k){ this.data.delete(k); }
}

class DummyLogger { error(){} info(){} warn(){} }

class DummyBC { postMessage(){} addEventListener(){} }

describe('Loader single-tab enforcement', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.BroadcastChannel;
  });

  it('warns when opened in second tab', async () => {
    const store = new DummyStore();
    const logger = new DummyLogger();
    const bus = new Observer();

    const dom1 = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });
    global.window = dom1.window;
    global.document = dom1.window.document;
    global.BroadcastChannel = DummyBC;
    const loader1 = new Loader(logger, store, bus);
    await loader1.load(async () => { bus.emit({ type: 'BOOT_COMPLETE' }); });
    clearInterval(loader1.heartbeat);

    const dom2 = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });
    global.window = dom2.window;
    global.document = dom2.window.document;
    global.BroadcastChannel = DummyBC;
    const loader2 = new Loader(logger, store, bus);
    const lang = new LanguageService(bus);
    lang.localization = new LocalizationAdapter(path.resolve('src/i18n/locales'));
    await lang.boot();
    const view = new LoaderView(bus, lang);
    view.boot();
    await loader2.load(async () => {});
    await new Promise(r => setTimeout(r));
    const msg = document.querySelector('.loader__message').textContent;
    assert.strictEqual(msg, 'Application already open in another tab');
    view.dispose();
    lang.dispose();
  });

  it('recovers from stale activeTab', async () => {
    const store = new DummyStore();
    store.save('activeTab', { value: 'stale-tab', timestamp: Date.now() - 10000 });
    const logger = new DummyLogger();
    const bus = new Observer();
    const dom = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.BroadcastChannel = DummyBC;
    const lang = new LanguageService(bus);
    lang.localization = new LocalizationAdapter(path.resolve('src/i18n/locales'));
    await lang.boot();
    const view = new LoaderView(bus, lang);
    view.boot();
    const loader = new Loader(logger, store, bus);
    let executed = false;
    await loader.load(async () => { executed = true; bus.emit({ type: 'BOOT_COMPLETE' }); });
    assert.strictEqual(executed, true);
    const overlay = document.querySelector('.loader');
    assert.strictEqual(overlay.classList.contains('loader--visible'), false);
    clearInterval(loader.heartbeat);
    view.dispose();
    lang.dispose();
  });

  it('recovers from stale loading state', async () => {
    const store = new DummyStore();
    store.save('appLoading', { value: 'boot:stale', timestamp: Date.now() - 10000 });
    const logger = new DummyLogger();
    const bus = new Observer();
    const dom = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.BroadcastChannel = DummyBC;
    const lang = new LanguageService(bus);
    lang.localization = new LocalizationAdapter(path.resolve('src/i18n/locales'));
    await lang.boot();
    const view = new LoaderView(bus, lang);
    view.boot();
    const loader = new Loader(logger, store, bus);
    let executed = false;
    await loader.load(async () => { executed = true; bus.emit({ type: 'BOOT_COMPLETE' }); });
    assert.strictEqual(executed, true);
    const overlay = document.querySelector('.loader');
    assert.strictEqual(overlay.classList.contains('loader--visible'), false);
    clearInterval(loader.heartbeat);
    view.dispose();
    lang.dispose();
  });
});

