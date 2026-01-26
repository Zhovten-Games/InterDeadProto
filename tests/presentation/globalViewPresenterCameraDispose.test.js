import { JSDOM } from 'jsdom';
import GlobalViewPresenter from '../../src/presentation/adapters/GlobalViewPresenter.js';
import { VIEW_CAMERA_RENDER_REQUESTED, VIEW_RENDER_REQUESTED } from '../../src/core/events/constants.js';

class StubBus {
  constructor() {
    this.events = [];
    this.handlers = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('GlobalViewPresenter camera disposal', () => {
  let dom;
  let document;
  let presenter;
  let bus;

  beforeEach(() => {
    dom = new JSDOM('<div data-js="global-content"></div><div data-js="bottom-panel"></div>', { url: 'http://localhost' });
    document = dom.window.document;
    global.window = dom.window;
    global.document = document;
    bus = new StubBus();
    const templateService = {
      async renderSection(target, screen) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        if (screen === 'camera') {
          el.innerHTML = '<div data-js="camera-widget"><div data-js="camera-view"></div></div>';
        } else {
          el.innerHTML = '<div></div>';
        }
      }
    };
    const panelService = { load: async () => {} };
    const language = { applyLanguage() {}, translate: async key => key };
    presenter = new GlobalViewPresenter(templateService, panelService, language, bus, null, console);
    presenter.boot();
  });

  afterEach(() => {
    presenter.dispose();
    delete global.window;
    delete global.document;
  });

  it('emits CAMERA_VIEW_CLOSED when disposing camera during screen change', async () => {
    await presenter._handleEvent({ type: VIEW_CAMERA_RENDER_REQUESTED, screen: 'camera', camera: { options: {}, panel: {} } });
    await new Promise(resolve => setTimeout(resolve, 0));
    await presenter._handleEvent({ type: VIEW_RENDER_REQUESTED, screen: 'messenger', payload: {}, view: {} });
    await new Promise(resolve => setTimeout(resolve, 0));

    const closedEvent = bus.events.find(evt => evt.type === 'CAMERA_VIEW_CLOSED');
    if (!closedEvent) {
      throw new Error('Expected CAMERA_VIEW_CLOSED event');
    }
  });
});
