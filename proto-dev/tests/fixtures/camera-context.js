import CameraOrchestrator from '../../src/camera/application/camera-orchestrator-service.js';
import EventBus from '../../src/runtime-events/adapters/event-bus-adapter.js';
import { createStore } from '../../src/narrative-runtime/engine/store.js';
import MediaRepository from '../../src/media/persistence/media-repository.js';

export const tick = () => new Promise((resolve) => setImmediate(resolve));
export function deferred() {
  let resolve, reject;
  const promise = new Promise((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
}
export function canvas({ failBlob = false } = {}) {
  const context = { fillStyle: '', fillRect() {}, drawImage() {} };
  return {
    width: 64,
    height: 64,
    getContext: () => context,
    toDataURL: () => 'data:image/png;base64,ZmFrZQ==',
    toBlob: (callback) =>
      callback(failBlob ? null : new Blob(['external canvas fixture'], { type: 'image/png' })),
  };
}
/** External camera/model/canvas ports. The application controller and store are real. */
export function cameraContext(options = {}) {
  const bus = new EventBus(),
    events = [],
    calls = {
      frames: 0,
      detections: 0,
      starts: 0,
      stops: 0,
      completed: 0,
      effects: [],
      buttons: [],
      visibility: [],
      presence: {},
      errors: [],
      compositions: [],
    };
  bus.subscribe((event) => events.push(event));
  const camera = {
    startStream: async () => {
      calls.starts++;
    },
    stopStream: () => {
      calls.stops++;
    },
    takeSelfie: async () => {
      calls.frames++;
      return new Blob(['frame']);
    },
    ...options.camera,
  };
  const detection = {
    detectTarget: async () => {
      calls.detections++;
      return { ok: true };
    },
    cancelPending() {},
    ...options.detection,
  };
  const duality = {
    isQuestActive: () => options.active !== false,
    getRequirement: () =>
      options.requirement === undefined
        ? { type: 'object', target: 'person' }
        : options.requirement,
    getStageConfig: () => options.stage || null,
    completeQuest: () => {
      calls.completed++;
    },
    ...options.duality,
  };
  const state = {
    setPresence: (target, value) => {
      calls.presence[target] = value;
    },
    resetPresence: () => {
      calls.presence = {};
    },
    resetCaptured() {},
    markCaptured() {},
  };
  const store = createStore(),
    dispatch = store.dispatch.bind(store);
  store.dispatch = (action) => {
    calls.effects.push(action);
    return dispatch(action);
  };
  const repository = options.repository || new MediaRepository();
  const composer = {
    compose: async (...args) => {
      calls.compositions.push(args);
      return canvas(options);
    },
    ...options.overlay,
  };
  const manager = new CameraOrchestrator(
    camera,
    detection,
    { error: (...args) => calls.errors.push(args) },
    state,
    duality,
    options.dialog || null,
    bus,
    {
      setScreenState: (screen, action, enabled) => calls.buttons.push({ screen, action, enabled }),
    },
    {
      setScreenVisibility: (screen, action, visible) =>
        calls.visibility.push({ screen, action, visible }),
    },
    composer,
    options.avatar || null,
    { advanceToUserTurn() {} },
    {},
    repository,
    { create: () => canvas(options) },
    store,
    options.engineEnabled ?? true,
    options.timeline || null,
  );
  manager.boot();
  return {
    manager,
    bus,
    events,
    calls,
    store,
    repository,
    camera,
    detection,
    duality,
    container: { offsetParent: {} },
    async dispose() {
      manager.dispose();
      repository.dispose?.();
      await bus.settled();
    },
  };
}
