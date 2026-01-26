import assert from 'assert';
import { JSDOM } from 'jsdom';
import PanelAdapter from '../../src/adapters/ui/PanelAdapter.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import ButtonVisibilityService from '../../src/application/services/ButtonVisibilityService.js';

class DummyTemplate {
  async render() {
    return '<div data-js="panel-controls"><div data-js="messenger-buttons"><button data-js="toggle-camera"></button></div></div>';
  }
  renderSection() {}
}

class DummyButtons { async init() {} }

const languageManager = { applyLanguage() {}, current: 'en' };
const stateService = { isButtonEnabled() { return true; } };
const buttonStateService = { isActive() { return true; }, setScreenState() {} };
const ghostService = { getCurrentGhost() { return { name: 'g' }; } };
const ghostSwitchService = { getUnlocked() { return ['g']; } };
function createPanel(bus, dualityManager) {
  const controls = { 'messenger-buttons': [{ template: 'button', action: 'toggle-camera' }] };
  const screenMap = { messenger: ['messenger-buttons'] };
  const tpl = new DummyTemplate();
  const btns = new DummyButtons();
  const visibility = new ButtonVisibilityService(bus, { load: () => null, save() {}, remove() {} });
  visibility.boot();
  const profile = {};
    const panel = new PanelAdapter(
      tpl,
      btns,
      languageManager,
      controls,
      screenMap,
      profile,
      stateService,
      buttonStateService,
      visibility,
      ghostService,
      ghostSwitchService,
      {},
      dualityManager,
      bus,
      '[data-js="bottom-panel"]'
    );
  panel.boot();
  return panel;
}

describe('camera button highlight', () => {
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

  it('adds and removes active class for camera quests', async () => {
    const dualityManager = { getRequirement: () => ({ type: 'object' }) };
    const panel = createPanel(bus, dualityManager);
    await panel.load({ screen: 'messenger' });
    const camBtn = document.querySelector('[data-js="toggle-camera"]');
    bus.emit({ type: 'QUEST_STARTED' });
    assert.ok(camBtn.classList.contains('active'));
    bus.emit({ type: 'QUEST_COMPLETED' });
    assert.ok(!camBtn.classList.contains('active'));
  });
});
