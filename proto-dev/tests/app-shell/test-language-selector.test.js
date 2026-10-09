import assert from 'assert';
import { JSDOM } from 'jsdom';
import PanelAdapter from '../../src/app-shell/controls/panel-adapter.js';
import ButtonAdapter from '../../src/app-shell/controls/button-adapter.js';
import Observer from '../../src/runtime-events/subscriptions/observer.js';
import ButtonVisibilityService from '../../src/app-shell/controls/button-visibility-service.js';

class DummyButtonService {
  constructor(bus) {
    this.bus = bus;
  }
  async init(container) {
    this.bus.emit({
      type: 'BUTTONS_RENDER',
      container,
      html: '<select data-js="language-selector"><option value="en" data-i18n="lang.en"></option><option value="ru" data-i18n="lang.ru"></option></select>',
    });
  }
}

class DummyLang {
  constructor() {
    this.current = 'ru';
    this.calls = 0;
  }
  applyLanguage() {
    this.calls++;
  }
}

const dom = new JSDOM('<div data-js="panel"><div data-js="foo"></div></div>');
global.document = dom.window.document;
global.window = dom.window;
const panelRoot = dom.window.document.querySelector('[data-js="panel"]');
const container = panelRoot.querySelector('[data-js="foo"]');
const bus = new Observer();

describe('Language selector', function () {
  it('reflects stored language', async function () {
    const lang = new DummyLang();
    const buttonService = new DummyButtonService(bus);
    new ButtonAdapter(bus, lang).boot();
    const controls = { foo: [{ template: 'language-selector', action: 'change-language' }] };
    const screenMap = { welcome: ['foo'] };
    const visibility = new ButtonVisibilityService(bus, {
      load: () => null,
      save() {},
      remove() {},
    });
    visibility.boot();
    const panel = new PanelAdapter(
      null,
      buttonService,
      lang,
      controls,
      screenMap,
      null,
      { isButtonEnabled: () => true },
      {
        isActive() {
          return true;
        },
      },
      visibility,
      {
        getCurrentGhost() {
          return { name: 'guide' };
        },
      },
      {
        getRequirement() {
          return null;
        },
      },
      bus,
      panelRoot,
    );
    await panel.update(panelRoot, { screen: 'welcome' });
    const select = container.querySelector('[data-js="language-selector"]');
    assert.strictEqual(select.value, 'ru');
    assert.ok(lang.calls > 0);
  });
});
