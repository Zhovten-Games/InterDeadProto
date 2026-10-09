import { cameraSessionPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import ViewService from '../../../src/app-shell/navigation/view-service.js';
import {
  APP_RESET_REQUESTED,
  RESET_OPTIONS_REQUESTED,
} from '../../../src/runtime-events/domain/constants.js';

describe('ViewService reset fallback', () => {
  it('emits app reset when no document is available', async () => {
    const previousDocument = global.document;
    delete global.document;
    const bus = {
      events: [],
      emit(evt) {
        this.events.push(evt);
      },
      subscribe() {},
      unsubscribe() {},
    };
    const view = new ViewService(
      {},
      { load: async () => {} },
      { applyLanguage() {}, translate: async (key) => key },
      { saveProfile: async () => {}, canProceed: () => true },
      null,
      { loadUser: async () => ({}) },
      {},
      {},
      { takeSelfie: async () => new Blob() },
      cameraSessionPort(null),
      null,
      { error() {} },
      { save() {}, load() {}, remove() {} },
      { setScreenState() {} },
      null,
      bus,
    );

    await view.resetData();

    if (previousDocument) {
      global.document = previousDocument;
    }

    assert.ok(bus.events.some((evt) => evt.type === APP_RESET_REQUESTED));
    assert.ok(!bus.events.some((evt) => evt.type === RESET_OPTIONS_REQUESTED));
    const resetEvent = bus.events.find((evt) => evt.type === APP_RESET_REQUESTED);
    assert.deepStrictEqual(resetEvent.payload, { source: 'view', reason: 'no_modal' });
  });
});
