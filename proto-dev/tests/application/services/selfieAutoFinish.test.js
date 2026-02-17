import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewService from '../../../src/application/services/ViewService.js';

// Ensures detection automatically marks captured and enables Finish

describe('selfie auto finish', () => {
  it('marks captured on detection', async () => {
    const dom = new JSDOM('<div data-js="detection-status"></div><button data-js="retry-detection" class="retry-detection retry-detection--hidden"></button>');
    global.window = dom.window;
    global.document = dom.window.document;
    let marked = false;
    const cameraSectionManager = {
      markCaptured() { marked = true; },
      stateService: { setPresence() {} }
    };
    const bus = { events: [], emit(evt){ this.events.push(evt); }, subscribe(){}, unsubscribe(){} };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async k => k },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      {},
      { takeSelfie: async () => new Blob() },
      cameraSectionManager,
      null,
      { error() {} },
      { save() {}, load() {} },
      { setScreenState() {} },
      {
        getRequirement: () => ({ target: 'person' }),
        getQuest: () => ({ overlay: {} })
      },
      bus
    );
    view.currentScreen = 'registration-camera';
    await view.handleCaptureEvents({ type: 'DETECTION_DONE', target: 'person' });
    assert.ok(marked);
    assert.ok(bus.events.find(e => e.type === 'BUTTON_STATE_UPDATED'));
    delete global.window;
    delete global.document;
  });
});
