import assert from 'assert';
import { JSDOM } from 'jsdom';
import CameraOrchestratorService from '../../src/application/services/CameraOrchestratorService.js';
import { BUTTON_STATE_UPDATED } from '../../src/core/events/constants.js';

class MockBus {
  constructor() {
    this.subscribers = [];
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter(f => f !== fn);
  }
  emit(evt) {
    this.subscribers.slice().forEach(f => f(evt));
  }
}

class MockButtonStateService {
  constructor(bus) {
    this.bus = bus;
    this.state = {};
  }
  setState(name, active, screen) {
    const key = screen ? `${screen}:${name}` : name;
    this.state[key] = active;
    this.bus.emit({ type: BUTTON_STATE_UPDATED, button: name, active, screen });
  }
  setScreenState(screen, action, active) {
    this.setState(action, active, screen);
  }
  isActive(name, screen) {
    const key = screen ? `${screen}:${name}` : name;
    return !!this.state[key];
  }
  isReady() {
    return true;
  }
}

class MockPanelAdapter {
  constructor(bus, buttonStateService) {
    this.bus = bus;
    this.buttonStateService = buttonStateService;
    this.currentScreen = null;
    this.panelContainer = null;
  }
  boot() {
    this.bus.subscribe(evt => {
      if (evt.type === BUTTON_STATE_UPDATED && evt.screen === this.currentScreen) {
        this.update();
      }
    });
  }
  async load({ screen }) {
    this.currentScreen = screen;
    const container = document.createElement('div');
    const btn = document.createElement('button');
    btn.setAttribute('data-action', 'post');
    btn.disabled = true;
    btn.classList.add('button--disabled');
    container.appendChild(btn);
    this.panelContainer = container;
  }
  update() {
    const btn = this.panelContainer.querySelector('[data-action="post"]');
    const enabled = this.buttonStateService.isActive('post', this.currentScreen);
    btn.disabled = !enabled;
    btn.classList.toggle('button--disabled', !enabled);
  }
}

describe('Post button state', () => {
  it('remains disabled after camera close until dialog expects reply', async () => {
    const dom = new JSDOM('<div></div>');
    global.window = dom.window;
    global.document = dom.window.document;

    const bus = new MockBus();
    const buttonStateService = new MockButtonStateService(bus);
    const panel = new MockPanelAdapter(bus, buttonStateService);
    panel.boot();
    await panel.load({ screen: 'messenger' });
    buttonStateService.setScreenState('messenger', 'post', false);

    const dialogManager = { dialog: { messages: [{ author: 'ghost' }], index: 1 } };
    const imageComposer = { compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }) };
    const repo = { save: async () => 1, get: async () => ({ thumbKey: '', fullKey: '' }), getObjectURL: async () => ({ url: '', revoke: () => {} }) };
    const cameraManager = new CameraOrchestratorService(
      { stopStream() {} },
      {},
      { error() {} },
      null,
      null,
      dialogManager,
      bus,
      buttonStateService,
      null,
      null,
      null,
      null,
      imageComposer,
      repo
    );
    cameraManager.boot();

    // Initial state disabled
    let postBtn = panel.panelContainer.querySelector('[data-action="post"]');
    assert.strictEqual(postBtn.disabled, true);

    // Close camera and reload screen
    bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
    await panel.load({ screen: 'messenger' });
    postBtn = panel.panelContainer.querySelector('[data-action="post"]');
    assert.strictEqual(postBtn.disabled, true);

    // Dialog now expects a reply
    dialogManager.dialog = { messages: [{ author: 'user' }], index: 0 };
    buttonStateService.setScreenState('messenger', 'post', true);
    postBtn = panel.panelContainer.querySelector('[data-action="post"]');
    assert.strictEqual(postBtn.disabled, false);

    delete global.window;
    delete global.document;
  });
});
