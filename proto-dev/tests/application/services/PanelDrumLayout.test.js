import assert from 'assert';
import { JSDOM } from 'jsdom';
import PanelService from '../../../src/adapters/ui/PanelAdapter.js';
import { DRUM_LAYOUT_UPDATED } from '../../../src/core/events/constants.js';

/** @description Ensures panel drum renders layouts and reacts to updates. */
describe('PanelService drum layout integration', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM('<div data-js="bottom-panel"></div>');
    window = dom.window;
    document = dom.window.document;
    global.window = window;
    global.document = document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('applies layout from drum service and refreshes on updates', async () => {
    const templateService = {
      async render() {
        return `
          <div data-js="panel-controls">
            <div class="panel__mask">
              <span class="panel__sector-emoji" data-slot="0">⬜</span>
              <span class="panel__sector-emoji" data-slot="1">⬜</span>
            </div>
            <div data-js="panel-bottom"></div>
          </div>
        `;
      }
    };
    const buttonService = { async init() {} };
    const languageManager = { applyLanguage() {}, current: 'en' };
    const controls = {};
    const screenMap = { messenger: [] };
    const profileRegService = {};
    const stateService = {
      isButtonEnabled() {
        return true;
      }
    };
    const buttonStateService = {
      getStatesForScreen: () => ({}),
      isActive: () => true
    };
    const buttonVisibilityService = {
      getVisibilityForScreen: () => ({})
    };
    const ghostService = {
      getCurrentGhost: () => ({ name: 'guide' }),
      setCurrentGhost() {}
    };
    const ghostSwitchService = {
      getUnlocked: () => ['guide']
    };
    const dualityManager = { getRequirement: () => null };
    const panelEffectsWidget = { mount() {} };
    const bus = {
      subscribers: [],
      subscribe(fn) {
        this.subscribers.push(fn);
      },
      emit(evt) {
        this.subscribers.forEach(handler => handler(evt));
      }
    };
    let layout = ['😀', '😁'];
    const drumLayoutService = {
      getLayout() {
        return layout;
      }
    };
    const panel = new PanelService(
      templateService,
      buttonService,
      languageManager,
      controls,
      screenMap,
      profileRegService,
      stateService,
      buttonStateService,
      buttonVisibilityService,
      ghostService,
      ghostSwitchService,
      {},
      dualityManager,
      panelEffectsWidget,
      bus,
      '[data-js="bottom-panel"]',
      drumLayoutService
    );
    panel.boot();
    await panel.load({ screen: 'messenger' });
    const slots = Array.from(document.querySelectorAll('.panel__sector-emoji'));
    assert.deepStrictEqual(
      slots.map(node => node.textContent),
      ['😀', '😁']
    );
    layout = ['😎', '😍'];
    bus.emit({ type: DRUM_LAYOUT_UPDATED, layout });
    assert.deepStrictEqual(
      slots.map(node => node.textContent),
      ['😎', '😍']
    );
  });
});
