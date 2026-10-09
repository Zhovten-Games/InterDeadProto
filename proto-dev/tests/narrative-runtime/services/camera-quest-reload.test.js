import { cameraPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DualityManager from '../../../src/narrative-runtime/sequence/duality-manager.js';
import CameraOrchestratorService from '../../../src/camera/application/camera-orchestrator-service.js';

function createBus() {
  return {
    handlers: [],
    subscribe(fn) {
      this.handlers.push(fn);
    },
    unsubscribe(fn) {
      this.handlers = this.handlers.filter((h) => h !== fn);
    },
    emit(evt) {
      this.handlers.slice().forEach((h) => h(evt));
    },
  };
}

function createStore() {
  return {
    data: {},
    save(key, val) {
      this.data[key] = val;
    },
    load(key) {
      return this.data[key];
    },
  };
}

const sequence = {
  id: 'seq',
  stages: [
    { event: { id: 'e1' } },
    {
      event: { id: 'e2' },
      quest: { id: 'q1', requirement: { type: 'object', target: 'person' } },
    },
  ],
};

describe('camera quest reload', () => {
  it('restarts detection when quest active and camera opens after reload', async () => {
    const bus = createBus();
    const store = createStore();
    const dm1 = new DualityManager(bus, store);
    dm1.load(sequence);
    dm1.start();
    dm1.completeCurrentEvent(); // advance to stage with quest
    dm1.completeCurrentEvent(); // start quest

    const dm2 = new DualityManager(bus, store);
    dm2.load(sequence); // emits QUEST_STARTED before orchestrator boots

    const cameraService = { startStream: async () => {} };
    const detectionService = {};
    const logger = { error() {} };
    const imageComposer = {
      compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }),
    };
    const repo = {
      save: async () => 1,
      get: async () => ({ thumbKey: '', fullKey: '' }),
      getObjectURL: async () => ({ url: '' }),
    };
    const buttonVisibilityService = { setScreenVisibility() {} };
    const stateService = { resetCaptured() {}, resetPresence() {} };
    const manager = new CameraOrchestratorService(
      cameraPort(cameraService),
      detectionService,
      logger,
      stateService,
      dm2,
      null,
      bus,
      null,
      buttonVisibilityService,
      null,
      null,
      null,
      imageComposer,
      repo,
    );

    let called = false;
    manager.startDetection = (container, opts) => {
      called = true;
      assert.strictEqual(opts.requirement.type, 'object');
      assert.strictEqual(opts.requirement.target, 'person');
    };

    manager.boot();
    await manager.open({});
    assert.ok(called);
  });

  it('restarts detection when quest restored after camera opens', async () => {
    const bus = createBus();
    const store = createStore();
    const dm1 = new DualityManager(bus, store);
    dm1.load(sequence);
    dm1.start();
    dm1.completeCurrentEvent();
    dm1.completeCurrentEvent();

    const dm2 = new DualityManager(bus, store);
    const cameraService = { startStream: async () => {} };
    const detectionService = {};
    const logger = { error() {} };
    const imageComposer = {
      compose: async () => ({ blobs: { thumb: new Blob(), full: new Blob() }, meta: {} }),
    };
    const repo = {
      save: async () => 1,
      get: async () => ({ thumbKey: '', fullKey: '' }),
      getObjectURL: async () => ({ url: '' }),
    };
    const buttonVisibilityService = { setScreenVisibility() {} };
    const stateService = { resetCaptured() {}, resetPresence() {} };
    const manager = new CameraOrchestratorService(
      cameraPort(cameraService),
      detectionService,
      logger,
      stateService,
      dm2,
      null,
      bus,
      null,
      buttonVisibilityService,
      null,
      null,
      null,
      imageComposer,
      repo,
    );

    let called = false;
    manager.startDetection = (container, opts) => {
      called = true;
      assert.strictEqual(opts.requirement.type, 'object');
      assert.strictEqual(opts.requirement.target, 'person');
    };

    manager.boot();
    await manager.open({});
    assert.strictEqual(called, false);
    dm2.load(sequence); // QUEST_STARTED after camera open
    assert.ok(called);
  });
});
