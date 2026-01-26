import assert from 'assert';
import ViewService from '../../../src/application/services/ViewService.js';
import { CAMERA_PREVIEW_READY } from '../../../src/core/events/constants.js';

// Ensures preview image updates when detection completes with a blob

describe('selfie preview auto populate', () => {
  it('shows captured frame after detection', async () => {
    global.window = undefined;
    global.document = undefined;
    global.URL.createObjectURL = () => 'blob:url';
    const events = [];
    const bus = {
      emit(evt) {
        events.push(evt);
      },
      subscribe() {},
      unsubscribe() {}
    };
    const cameraSectionManager = { markCaptured() {}, stateService: { setPresence() {} } };
    let storedAvatar = null;
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async k => k },
      {
        saveProfile: async () => {},
        canProceed: () => true,
        setAvatar: v => {
          storedAvatar = v;
        }
      },
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
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    await view.handleCaptureEvents({ type: 'DETECTION_DONE', target: 'person', blob });
    const expected = `data:image/jpeg;base64,${Buffer.from('dummy').toString('base64')}`;
    assert.strictEqual(storedAvatar, expected);
    const previewEvent = events.find(evt => evt.type === CAMERA_PREVIEW_READY);
    assert.strictEqual(previewEvent.blobUrl, 'blob:url');
    delete global.URL.createObjectURL;
  });
});
