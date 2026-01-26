import assert from 'assert';
import { JSDOM } from 'jsdom';
import Observer from '../../../src/utils/Observer.js';
import LoaderView from '../../../src/presentation/widgets/LoaderView.js';
import LanguageService from '../../../src/adapters/ui/LanguageAdapter.js';
import LocalizationAdapter from '../../../src/adapters/ui/LocalizationAdapter.js';
import path from 'path';

class DummyLogger { info(){} warn(){} error(){} }
class DummyStore { constructor(){this.map=new Map();}
  load(k){return this.map.get(k);} save(k,v){this.map.set(k,v);} remove(k){this.map.delete(k);} }

class StubLoaderNameProvider {
  constructor(map) {
    this.map = map;
  }

  async getRandomName(key) {
    return this.map[key] || key;
  }
}

class InstantEffect {
  async play(element, text) {
    element.textContent = text;
  }
}

const dom = new JSDOM('<div data-js="global-content"></div>', { url: 'http://localhost' });

describe('Loader progress overlay', function(){
  before(function(){
    global.document = dom.window.document;
    global.window = dom.window;
    document.body.innerHTML = '';
    global.sessionStorage = dom.window.sessionStorage;
    global.BroadcastChannel = class { constructor(){this.messages=[];} postMessage(m){this.messages.push(m);} addEventListener(){} };
  });
  it('updates list and hides after boot', async function(){
    const bus = new Observer();
    const { default: Loader } = await import('../../../src/infrastructure/bootstrap/Loader.js');
    const lang = new LanguageService(bus);
    lang.localization = new LocalizationAdapter(path.resolve('src/i18n/locales'));
    await lang.boot();
    const nameProvider = new StubLoaderNameProvider({ 'boot.db': 'Database', 'boot.camera': 'Camera' });
    const view = new LoaderView(bus, lang, nameProvider, () => new InstantEffect());
    view.boot();
    const loader = new Loader(new DummyLogger(), new DummyStore(), bus);
    await loader.load(async () => {
      bus.emit({ type:'BOOT_STEP', name:'DatabaseService' });
      bus.emit({ type:'BOOT_STEP', name:'DatabaseService' });
      bus.emit({ type:'BOOT_STEP', name:'CameraService' });
      await new Promise(r => setTimeout(r, 0));
      const overlay = document.querySelector('.loader');
      const items = overlay.querySelectorAll('.loader__list li');
      assert.strictEqual(items.length, 2);
      assert.strictEqual(items[0].dataset.loaderKey, 'boot.db');
      assert.strictEqual(items[0].textContent, 'Database');
      assert.strictEqual(items[1].textContent, 'Camera');
      bus.emit({ type:'BOOT_COMPLETE' });
    });
    clearInterval(loader.heartbeat);
    view.dispose();
    lang.dispose();
  });
  after(function(){
    delete global.BroadcastChannel;
    delete global.sessionStorage;
    delete global.document;
    delete global.window;
  });
});
