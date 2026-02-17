import assert from 'assert';
import { JSDOM } from 'jsdom';
import PanelAdapter from '../../src/adapters/ui/PanelAdapter.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import ButtonVisibilityService from '../../src/application/services/ButtonVisibilityService.js';

const languageManager = { applyLanguage() {}, current: 'en' };
const stateService = { isButtonEnabled() { return true; } };
const buttonStateService = { isActive() { return true; }, setScreenState() {} };

class DummyTemplate {
  async render() {
    return '<div data-js="panel-controls">\n      <div data-js="messenger-buttons" class="panel--hidden"></div>\n      <div data-js="camera-buttons" class="panel--hidden"></div>\n    </div>';
  }
  renderSection() {}
}
class DummyButtons {
  async init(section, defs) {
    section.innerHTML = defs
      .map(d => `<button data-js="${d.action}" data-action="${d.action}"></button>`)
      .join('');
  }
}

function createPanel(bus) {
  const controls = {
    'messenger-buttons': [
      { template: 'button', action: 'toggle-camera' }
    ],
    'camera-buttons': [
      { template: 'button', action: 'toggle-messenger' }
    ]
  };
  const screenMap = {
    messenger: ['messenger-buttons'],
    camera: ['camera-buttons']
  };
  const tpl = new DummyTemplate();
  const btns = new DummyButtons();
  const visibility = new ButtonVisibilityService(bus, { load: () => null, save(){}, remove(){} });
  visibility.boot();
  visibility.setScreenVisibility('camera', 'toggle-messenger', true);
  return new PanelAdapter(tpl, btns, languageManager, controls, screenMap, {}, stateService, buttonStateService, visibility, {}, {}, bus, '[data-js="bottom-panel"]');
}

describe('screen button exclusivity', () => {
  let dom;
  let bus;
  beforeEach(() => {
    dom = new JSDOM('<div data-js="bottom-panel"></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    bus = new EventBusAdapter();
  });
  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('shows only relevant toggle per screen without flashes', async () => {
    const panel = createPanel(bus);
    await panel.load({ screen: 'messenger' });
    const camBtn = panel.panelContainer.querySelector('[data-js="toggle-camera"]');
    const msgBtn = panel.panelContainer.querySelector('[data-js="toggle-messenger"]');
    assert.ok(camBtn && !camBtn.classList.contains('panel--hidden'));
    assert.strictEqual(msgBtn, null);

    await panel.load({ screen: 'camera' });
    const camBtn2 = panel.panelContainer.querySelector('[data-js="toggle-camera"]');
    const msgBtn2 = panel.panelContainer.querySelector('[data-js="toggle-messenger"]');
    assert.strictEqual(camBtn2, null);
    assert.ok(msgBtn2 && !msgBtn2.classList.contains('panel--hidden'));
  });
});
