import assert from 'assert';
import { JSDOM } from 'jsdom';
import PanelAdapter from '../../src/adapters/ui/PanelAdapter.js';
import ButtonAdapter from '../../src/adapters/ui/ButtonAdapter.js';
import Observer from '../../src/utils/Observer.js';
import GhostSwitchService from '../../src/application/services/GhostSwitchService.js';
import ButtonVisibilityService from '../../src/application/services/ButtonVisibilityService.js';

class DummyTemplate {
  async render(name) {
    if (name === 'panel') {
      return '<div data-js="panel-controls">\n        <div data-js="selfie-buttons" class="panel--hidden"></div>\n        <div data-js="camera-buttons" class="panel--hidden"></div>\n        <div data-js="messenger-buttons" class="panel--hidden"></div>\n        <div data-js="ghost-switcher-buttons" class="panel--hidden"></div>\n      </div>';
    }
    return '';
  }
  renderSection() {}
}

class DummyButtons {
  constructor(bus) { this.bus = bus; }
  async init(section, defs) {
    const html = defs
      .map(d => {
        if (d.template === 'ghost-switcher') {
          return `<select data-js="ghost-select" data-action="${d.action}"></select>`;
        }
        return `<button data-action="${d.action}" data-js="${d.action}"></button>`;
      })
      .join('');
    this.bus.emit({ type: 'BUTTONS_RENDER', container: section, html });
  }
}

const languageManager = { applyLanguage() {}, current: 'en' };
const stateService = { isButtonEnabled() { return true; } };
const buttonStateService = { isActive() { return true; }, setScreenState() {} };

function createPanel(
  bus,
  ghostService,
  ghostSwitch,
  configs,
  modalService = { show() {}, hide() {} }
) {
  const controls = {
    'selfie-buttons': [{ template: 'button', action: 'finish' }],
    'camera-buttons': [
      { template: 'button', action: 'capture-btn' },
      { template: 'button', action: 'toggle-messenger' }
    ],
    'messenger-buttons': [
      { template: 'button', action: 'post' },
      { template: 'button', action: 'toggle-camera' },
      { template: 'button', action: 'reset-data' }
    ],
    'ghost-switcher-buttons': [{ template: 'ghost-switcher', action: 'switch-ghost' }]
  };
  const screenMap = {
    'registration-camera': ['selfie-buttons'],
    camera: ['camera-buttons'],
    messenger: ['messenger-buttons', 'ghost-switcher-buttons']
  };
  const tpl = new DummyTemplate();
  const btns = new DummyButtons(bus);
  const profileRegService = {};
  const dualityManager = { getRequirement() { return { type: 'presence' }; } };
  const visibility = new ButtonVisibilityService(bus, { load: () => null, save(){}, remove(){} });
  visibility.boot();
  return new PanelAdapter(
    tpl,
    btns,
    languageManager,
    controls,
    screenMap,
    profileRegService,
    stateService,
    buttonStateService,
    visibility,
    ghostService,
    ghostSwitch,
    configs,
    dualityManager,
    null,
    modalService,
    bus,
    '[data-js="bottom-panel"]'
  );
}

describe('PanelAdapter rendering', () => {
  let dom;
  let bus;
  let ghostService;
  let ghostSwitch;
  let modalService;
  const configs = {
    g1: { unlock: { requires: [] } },
    g2: { unlock: { requires: ['g1'] } },
    g3: { unlock: { requires: ['g1'] } }
  };

  beforeEach(() => {
    dom = new JSDOM('<div data-js="bottom-panel"></div>', { url: 'http://localhost' });
    global.window = dom.window;
    global.document = dom.window.document;
    bus = new Observer();
    ghostService = {
      _name: 'g1',
      getCurrentGhost() { return { name: this._name }; },
      setCurrentGhost(n) { this._name = n; }
    };
    const store = { data: {}, save(k,v){ this.data[k]=v; }, load(k){ return this.data[k]; } };
    ghostSwitch = new GhostSwitchService(store, bus);
    modalService = { shown: null, hidden: false, show: node => { modalService.shown = node; }, hide: () => { modalService.hidden = true; } };
    new ButtonAdapter(bus, languageManager);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('toggles sections using panel--hidden class', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    await panel.load({ screen: 'registration-camera' });
    const selfie = panel.panelContainer.querySelector('[data-js="selfie-buttons"]');
    const messenger = panel.panelContainer.querySelector('[data-js="messenger-buttons"]');
    assert.ok(!selfie.classList.contains('panel--hidden'));
    assert.ok(messenger.classList.contains('panel--hidden'));
    await panel.load({ screen: 'messenger' });
    const updatedSelfie = panel.panelContainer.querySelector('[data-js="selfie-buttons"]');
    const updatedMessenger = panel.panelContainer.querySelector('[data-js="messenger-buttons"]');
    assert.ok(updatedSelfie.classList.contains('panel--hidden'));
    assert.ok(!updatedMessenger.classList.contains('panel--hidden'));
  });

  it('skips stale selfie updates after finish', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    await panel.load({ screen: 'registration-camera' });
    await panel.load({ screen: 'messenger' });
    bus.emit({ type: 'BUTTON_STATE_UPDATED', screen: 'registration-camera' });
    const capture = panel.panelContainer.querySelector('[data-action="capture-btn"]');
    const finish = panel.panelContainer.querySelector('[data-action="finish"]');
    assert.strictEqual(capture, null);
    assert.strictEqual(finish, null);
    assert.ok(panel.panelContainer.querySelector('[data-action="post"]'));
  });

  it('renders registered-user controls on messenger screen', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    await panel.load({ screen: 'messenger' });
    const camBtn = panel.panelContainer.querySelector('[data-js="toggle-camera"]');
    const msgBtn = panel.panelContainer.querySelector('[data-js="toggle-messenger"]');
    assert.ok(camBtn && !camBtn.classList.contains('panel--hidden'));
    assert.strictEqual(msgBtn, null);
  });

  it('switches toggle buttons on camera events', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    await panel.load({ screen: 'camera' });
    const vis = panel.buttonVisibilityService;
    vis.setScreenVisibility('camera', 'toggle-messenger', true);
    await new Promise(r => setTimeout(r, 0));
    const msgBtn = panel.panelContainer.querySelector('[data-js="toggle-messenger"]');
    assert.ok(!msgBtn.classList.contains('panel--hidden'));
  });

  it('disables ghost switcher until additional ghosts unlock', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    await panel.load({ screen: 'messenger' });
    const container = panel.panelContainer.querySelector('[data-js="ghost-switcher-buttons"]');
    assert.ok(!container.classList.contains('panel--hidden'));
    let select = container.querySelector('[data-js="ghost-select"]');
    assert.strictEqual(select.disabled, true);
    ghostSwitch.markCompleted('g1', configs);
    await new Promise(r => setTimeout(r, 10));
    select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    assert.strictEqual(select.disabled, false);
  });

  it('keeps ghost switcher after ghost change', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    ghostSwitch.markCompleted('g1', configs);
    await panel.load({ screen: 'messenger' });
    let select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    select.value = 'g2';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    bus.emit({ type: 'GHOST_CHANGE', payload: { name: 'g2' } });
    select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    select.value = 'g3';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.strictEqual(ghostService._name, 'g3');
  });

  it('renders ghost options dynamically from unlocked list', async () => {
    const panel = createPanel(bus, ghostService, ghostSwitch, configs);
    panel.boot();
    ghostSwitch.markCompleted('g1', configs);
    await panel.load({ screen: 'messenger' });
    const select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    const values = Array.from(select.options).map(o => o.value).sort();
    assert.deepStrictEqual(values, ['g1', 'g2', 'g3']);
  });

  it('shows a confirmation modal only when leaving an unfinished guide', async () => {
    ghostService._name = 'guide';
    const guideConfigs = {
      guide: { unlock: { requires: [] } },
      guest1: { unlock: { requires: ['guide'], alwaysVisible: true } }
    };
    const panel = createPanel(bus, ghostService, ghostSwitch, guideConfigs, modalService);
    panel.boot();
    await panel.load({ screen: 'messenger' });
    const select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    select.value = 'guest1';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.ok(modalService.shown, 'modal rendered for unfinished guide');
    const confirm = modalService.shown.querySelector('.ghost-switch-modal__button--confirm');
    confirm.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
    assert.strictEqual(ghostService._name, 'guest1');
  });

  it('skips confirmation once the guide is completed', async () => {
    ghostService._name = 'guide';
    ghostSwitch.markCompleted('guide', configs);
    const guideConfigs = {
      guide: { unlock: { requires: [] } },
      guest1: { unlock: { requires: ['guide'], alwaysVisible: true } }
    };
    const panel = createPanel(bus, ghostService, ghostSwitch, guideConfigs, modalService);
    panel.boot();
    await panel.load({ screen: 'messenger' });
    const select = panel.panelContainer.querySelector('[data-js="ghost-select"]');
    select.value = 'guest1';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.ok(!modalService.shown, 'no modal after completion');
    assert.strictEqual(ghostService._name, 'guest1');
  });
});
