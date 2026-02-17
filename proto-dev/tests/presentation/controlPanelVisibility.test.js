import assert from 'assert';
import { JSDOM } from 'jsdom';
import ControlPanel from '../../src/presentation/widgets/ControlPanel/index.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import ButtonAdapter from '../../src/adapters/ui/ButtonAdapter.js';

const controls = {
  'landing-buttons': [{ template: 'button', action: 'next' }],
  'registration-buttons': [{ template: 'button', action: 'next' }],
  'apartment-plan-buttons': [{ template: 'button', action: 'detect-geo' }],
  'selfie-buttons': [{ template: 'button', action: 'finish' }],
  'messenger-buttons': [
    { template: 'button', action: 'post' },
    { template: 'button', action: 'toggle-camera' }
  ],
  'camera-buttons': [
    { template: 'button', action: 'capture-btn' },
    { template: 'button', action: 'toggle-messenger' }
  ],
  'ghost-switcher-buttons': [{ template: 'button', action: 'switch-ghost' }],
};

const screenMap = {
  welcome: ['landing-buttons'],
  registration: ['registration-buttons'],
  'apartment-plan': ['apartment-plan-buttons'],
  'registration-camera': ['selfie-buttons'],
  camera: ['camera-buttons'],
  messenger: ['messenger-buttons', 'ghost-switcher-buttons'],
};

const languageService = { applyLanguage() {} };

const template = `<div data-js="panel-controls">
  <div data-js="landing-buttons" class="panel--hidden"></div>
  <div data-js="registration-buttons" class="panel--hidden"></div>
  <div data-js="apartment-plan-buttons" class="panel--hidden"></div>
  <div data-js="selfie-buttons" class="panel--hidden"></div>
  <div data-js="messenger-buttons" class="panel--hidden"></div>
  <div data-js="camera-buttons" class="panel--hidden"></div>
  <div data-js="ghost-switcher-buttons" class="panel--hidden"></div>
</div>`;

describe('ControlPanel visibility', () => {
  let dom;
  let panel;
  let bus;
  let buttonService;

  beforeEach(async () => {
    dom = new JSDOM('<div data-js="bottom-panel"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    bus = new EventBusAdapter();
    buttonService = {
      async init(section, defs) {
        const html = defs
          .map(d => {
            const hidden = d.action === 'toggle-messenger' ? ' class="panel--hidden"' : '';
            return `<button data-action="${d.action}" data-js="${d.action}"${hidden}></button>`;
          })
          .join('');
        bus.emit({ type: 'BUTTONS_RENDER', container: section, html });
      }
    };
    new ButtonAdapter(bus, languageService);
    panel = new ControlPanel(controls, screenMap, buttonService, languageService, '[data-js="bottom-panel"]', bus);
    panel.loadTemplate = async () => template;
    panel.init();
  });

  afterEach(() => {
    panel.dispose();
    delete global.window;
    delete global.document;
  });

  it('shows correct sections for each screen', async () => {
    for (const screen of Object.keys(screenMap)) {
      bus.emit({ type: 'SCREEN_CHANGE', screen });
      await new Promise(r => setTimeout(r, 0));
      for (const key of Object.keys(controls)) {
        const el = document.querySelector(`[data-js="${key}"]`);
        const visible = !el.classList.contains('panel--hidden');
        const shouldBeVisible = screenMap[screen].includes(key);
        assert.strictEqual(visible, shouldBeVisible, `${key} visibility mismatch on ${screen}`);
      }
    }
  });

  // camera and messenger button switching is handled via screen change now
});
