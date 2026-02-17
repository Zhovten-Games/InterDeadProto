import assert from 'assert';
import { JSDOM } from 'jsdom';
import ControlPanel from '../../src/presentation/widgets/ControlPanel/index.js';
import EventBusAdapter from '../../src/adapters/logging/EventBusAdapter.js';
import { DIALOG_AWAITING_INPUT_CHANGED } from '../../src/core/events/constants.js';

const controls = {
  'messenger-buttons': [{ template: 'button', action: 'toggle-camera' }],
  'camera-buttons': [{ template: 'button', action: 'toggle-messenger' }]
};
const screenMap = { messenger: ['messenger-buttons'], camera: ['camera-buttons'] };

const buttonService = {
  async init(section, defs) {
    section.innerHTML = defs
      .map(d => `<button data-js="${d.action}" data-action="${d.action}"></button>`)
      .join('');
  }
};
const language = { applyLanguage() {} };

describe('ControlPanel navigation highlight', () => {
  it('highlights navigation to pending screen', async () => {
    const dom = new JSDOM('<div data-js="bottom-panel"></div>');
    global.window = dom.window; global.document = dom.window.document;
    const bus = new EventBusAdapter();
    const panel = new ControlPanel(controls, screenMap, buttonService, language, '[data-js="bottom-panel"]', bus);
    panel.loadTemplate = async () => '<div data-js="panel-controls"><div data-js="messenger-buttons"></div><div data-js="camera-buttons"></div></div>';
    panel.init();
    await panel.render('messenger');
    bus.emit({ type: DIALOG_AWAITING_INPUT_CHANGED, awaits: true, kind: 'camera_capture', targetScreen: 'camera' });
    const camBtn = document.querySelector('[data-js="toggle-camera"]');
    assert.ok(camBtn.classList.contains('active'));
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    await panel.render('camera');
    bus.emit({ type: DIALOG_AWAITING_INPUT_CHANGED, awaits: true, kind: 'user_text', targetScreen: 'messenger' });
    const msgBtn = document.querySelector('[data-js="toggle-messenger"]');
    assert.ok(msgBtn.classList.contains('active'));
    delete global.window; delete global.document;
  });
});
