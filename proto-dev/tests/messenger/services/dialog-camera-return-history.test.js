import { adaptHistoryPort, flushEvents } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import DialogInputGateService from '../../../src/messenger/application/dialog-input-gate-service.js';
import EventBusAdapter from '../../../src/runtime-events/adapters/event-bus-adapter.js';
import DualityManager from '../../../src/narrative-runtime/sequence/duality-manager.js';
import { createStore } from '../../../src/narrative-runtime/engine/store.js';
import DialogHistoryService from '../../../src/messenger/history/dialog-history-service.js';
import DialogRepository from '../../../src/messenger/persistence/dialog-repository.js';
import guide from '../../../src/spirit-contacts/configuration/guide.js';
import guest1 from '../../../src/spirit-contacts/configuration/guest1.js';
import { openDatabase, persistence } from '../../../../constitutional-guard/driver-tools.mjs';
import { deferred } from '../../../../constitutional-guard/driver-tools.mjs';
import { canvas } from '../../fixtures/camera-context.js';
import CameraOrchestratorService from '../../../src/camera/application/camera-orchestrator-service.js';
import MediaRepository from '../../../src/media/persistence/media-repository.js';
import NullLogger from '../../../src/runtime-diagnostics/null-logger.js';
import {
  DIALOG_WIDGET_READY,
  EVENT_MESSAGE_READY,
  GHOST_RESET_REQUESTED,
} from '../../../src/runtime-events/domain/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach((h) => h(evt));
  }
}

describe('DialogOrchestratorService camera return', () => {
  it('replays history when returning from camera without duplicates', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) {
        this.dialog = new Dialog(cfg.stages[0].event.messages);
      },
      start() {
        dialogManager.progress();
      },
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      },
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyStore = [];
    const historyService = {
      load: () => [...historyStore],
      save() {},
      append(_g, msgs) {
        historyStore.push(...msgs);
      },
    };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};
    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);

    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      buttons,
      { setScreenVisibility() {} },
      adaptHistoryPort(historyService),
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus,
    );

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'hello', fingerprint: 'g1' },
              { author: 'user', text: 'ok', fingerprint: 'u1' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    // Progress user reply
    bus.emit({ type: 'post' });
    await flushEvents();

    const initialGhost = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && !e.replay && e.fingerprint === 'g1',
    );
    const initialUser = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && !e.replay && e.fingerprint === 'u1',
    );
    assert.strictEqual(initialGhost.length, 1);
    assert.strictEqual(initialUser.length, 1);

    bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    bus.emit({ type: DIALOG_WIDGET_READY });
    await flushEvents();
    await flushEvents();

    const replayGhost = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.replay && e.fingerprint === 'g1',
    );
    const replayUser = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.replay && e.fingerprint === 'u1',
    );
    assert.strictEqual(replayGhost.length, 0);
    assert.deepStrictEqual(
      svc.timeline.getSnapshot().messages.map((row) => row.fingerprint),
      ['g1', 'u1'],
    );
    assert.strictEqual(replayUser.length, 0);
    const totalGhost = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'g1',
    );
    const totalUser = bus.events.filter(
      (e) => e.type === EVENT_MESSAGE_READY && e.fingerprint === 'u1',
    );
    assert.strictEqual(totalGhost.length, 1);
    assert.strictEqual(totalUser.length, 1);
    svc.dispose();
  });

  it('preserves order without duplicates across repeated screen toggles', async () => {
    const bus = new Bus();
    const screen = new ScreenService(bus);
    screen.boot();
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const buttons = new ButtonStateService(bus, store, screen);
    buttons.boot();

    const dialogManager = new DialogManager(null, bus, null);
    const dualityManager = {
      load(cfg) {
        this.dialog = new Dialog(cfg.stages[0].event.messages);
      },
      start() {
        dialogManager.progress();
      },
      getCurrentDialog() {
        return this.dialog;
      },
      completeCurrentEvent() {},
      isQuestActive() {
        return false;
      },
    };
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const historyService = {
      load: () => [
        { author: 'ghost', text: 'hello', fingerprint: 'g1' },
        { author: 'user', text: 'ok', fingerprint: 'u1' },
      ],
      save() {},
    };
    const avatarService = { getUserAvatar: async () => '' };
    const ghostSwitchService = {};
    const spiritConfigs = {};
    const gate = new DialogInputGateService(dialogManager, dualityManager, bus);

    const svc = new DialogOrchestratorService(
      dualityManager,
      dialogManager,
      ghostService,
      buttons,
      { setScreenVisibility() {} },
      adaptHistoryPort(historyService),
      avatarService,
      ghostSwitchService,
      spiritConfigs,
      gate,
      bus,
    );

    svc._loadConfig = async () => ({
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'hello', fingerprint: 'g1' },
              { author: 'user', text: 'ok', fingerprint: 'u1' },
            ],
          },
        },
      ],
    });
    // Configuration enrichment is exercised through the production contract.

    svc.boot();

    const cycle = async () => {
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      bus.emit({ type: DIALOG_WIDGET_READY });
      await flushEvents();
      await flushEvents();
      bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
    };

    // Perform three messenger entries
    await cycle();
    await cycle();
    await cycle();

    const sequence = bus.events
      .filter((e) => e.type === EVENT_MESSAGE_READY)
      .map((e) => e.fingerprint);
    assert.deepStrictEqual(sequence, []);
    const snapshots = bus.events.filter(
      (event) => event.type === 'DIALOG_HISTORY_REPLACED' && event.snapshot.ghost === 'guide',
    );
    assert.ok(snapshots.length >= 3);
    for (const { snapshot } of snapshots)
      assert.deepStrictEqual(
        snapshot.messages.map((row) => row.fingerprint),
        ['g1', 'u1'],
      );
    svc.dispose();
  });
});

// Exercise the real sequence, gate, timeline and SQLite boundary together.
// A successful return must permit the next public post, not just replay history.
function recoverySession(
  storage,
  database,
  initialGhost = 'guide',
  avatar = { getUserAvatar: async () => '' },
) {
  const bus = new EventBusAdapter();
  const screen = new ScreenService(bus);
  screen.boot();
  const buttons = new ButtonStateService(bus, storage, screen);
  buttons.boot();
  const repository = new DialogRepository(database);
  repository.boot();
  const history = new DialogHistoryService(repository);
  const manager = new DialogManager(null, bus, storage);
  const duality = new DualityManager(bus, storage);
  const ghost = {
    current: initialGhost,
    getCurrentGhost() {
      return { name: this.current };
    },
    commitCurrentGhost(name) {
      this.current = name;
    },
  };
  const engine = createStore();
  const gate = new DialogInputGateService(manager, duality, bus, engine);
  const service = new DialogOrchestratorService(
    duality,
    manager,
    ghost,
    buttons,
    null,
    history,
    avatar,
    null,
    { guide, guest1 },
    gate,
    bus,
    null,
    undefined,
    engine,
  );
  service.boot();
  return {
    bus,
    buttons,
    history,
    manager,
    duality,
    gate,
    engine,
    timeline: service.timeline,
    async emit(event) {
      bus.emit(event);
      await bus.settled();
    },
    async enter() {
      await this.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      await this.emit({ type: DIALOG_WIDGET_READY });
    },
    async cameraReturn() {
      await this.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
      await this.enter();
    },
    async switchTo(name) {
      await this.emit({ type: 'GHOST_CHANGE', payload: { name } });
    },
    async post(expectedText) {
      assert.equal(buttons.isActive('post', 'messenger'), true, 'Post must be enabled');
      const before = history.load(ghost.current).length;
      await this.emit({ type: 'post' });
      const accepted = history.load(ghost.current).slice(before);
      assert.ok(
        accepted.some((row) => row.author === 'user' && row.text === expectedText),
        `Post must accept the next user occurrence: ${expectedText}`,
      );
      const snapshot = this.timeline.getSnapshot();
      assert.deepEqual(
        snapshot.messages.map((row) => row.fingerprint),
        history.load(ghost.current).map((row) => row.fingerprint),
      );
      assert.equal(
        new Set(snapshot.messages.map((row) => row.fingerprint)).size,
        snapshot.messages.length,
      );
    },
    dispose() {
      service.dispose();
      buttons.dispose();
      screen.dispose();
    },
  };
}

describe('Messenger recovery through public ports', () => {
  for (const [name, firstReply] of [
    ['guide', 'guide.user.reply1'],
    ['guest1', 'guest1.handshake.user1'],
  ]) {
    it(`${name}: sends after repeated camera returns at an unfinished user turn`, async () => {
      const storage = persistence();
      const database = await openDatabase(storage);
      const session = recoverySession(storage, database, name);
      try {
        await session.enter();
        for (let cycle = 0; cycle < 3; cycle += 1) await session.cameraReturn();
        await session.post(firstReply);
      } finally {
        session.dispose();
        await database.dispose();
      }
    });
    it(`${name}: restores an unfinished turn after camera, reload and chat switches`, async () => {
      const storage = persistence();
      const database = await openDatabase(storage);
      let session = recoverySession(storage, database, name);
      try {
        await session.enter();
        await session.cameraReturn();
        const saved = session.history.load(name);
        session.dispose();
        session = recoverySession(storage, database, name);
        await session.enter();
        await session.switchTo(name === 'guide' ? 'guest1' : 'guide');
        await session.switchTo(name);
        assert.deepEqual(session.history.load(name), saved);
        await session.cameraReturn();
        await session.post(firstReply);
      } finally {
        session.dispose();
        await database.dispose();
      }
    });
  }
  it('GUIDE reset and completed camera quest permit the next reply after returning', async () => {
    const storage = persistence();
    const database = await openDatabase(storage);
    const session = recoverySession(storage, database);
    try {
      await session.enter();
      await session.post('guide.user.reply1');
      await session.emit({ type: GHOST_RESET_REQUESTED, payload: { ghost: 'guide' } });
      for (const text of ['guide.user.reply1', 'guide.user.reply2', 'guide.user.reply3'])
        await session.post(text);
      assert.equal(session.duality.getQuest()?.id, 'find-person');
      assert.equal(session.duality.isQuestActive(), true);
      await session.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
      // Camera publication is an external input here; stage advancement is real.
      session.duality.completeQuest();
      await session.bus.settled();
      await session.enter();
      await session.post('guide.user.reply4');
      await session.cameraReturn();
      await session.post('guide.user.reply5');
      assert.equal(session.buttons.isActive('post', 'messenger'), false);
      const completed = session.history.load('guide');
      await session.switchTo('guest1');
      await session.switchTo('guide');
      await session.cameraReturn();
      assert.deepEqual(session.history.load('guide'), completed);
      assert.equal(session.buttons.isActive('post', 'messenger'), false);
    } finally {
      session.dispose();
      await database.dispose();
    }
  });
});

describe('Messenger sequence recovery and capture integration', () => {
  it('reloads each unfinished GUIDE turn, preserves A-B-A history and accepts exactly the next reply', async () => {
    const storage = persistence(),
      database = await openDatabase(storage);
    let session = recoverySession(storage, database);
    try {
      await session.enter();
      for (const text of ['guide.user.reply1', 'guide.user.reply2', 'guide.user.reply3']) {
        const before = session.history.load('guide');
        await session.switchTo('guest1');
        await session.switchTo('guide');
        await session.cameraReturn();
        session.dispose();
        session = recoverySession(storage, database);
        await session.enter();
        assert.deepEqual(session.history.load('guide'), before);
        await session.post(text);
      }
      assert.equal(session.duality.isQuestActive(), true);
      session.dispose();
      session = recoverySession(storage, database);
      await session.enter();
      assert.equal(session.duality.isQuestActive(), true, 'reload must resume the camera quest');
      assert.equal(session.buttons.isActive('post', 'messenger'), false);
    } finally {
      session.dispose();
      await database.dispose();
    }
  });

  it('publishes a real camera capture after GUIDE reset, reloads its image and continues the outro', async () => {
    const storage = persistence(),
      database = await openDatabase(storage);
    let session = recoverySession(storage, database);
    const media = new MediaRepository();
    let camera;
    try {
      await session.enter();
      await session.emit({ type: GHOST_RESET_REQUESTED, payload: { ghost: 'guide' } });
      for (const text of ['guide.user.reply1', 'guide.user.reply2', 'guide.user.reply3'])
        await session.post(text);
      await session.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
      camera = new CameraOrchestratorService(
        {
          startStream: async () => {},
          stopStream() {},
          takeSelfie: async () => new Blob(['external frame']),
        },
        { detectTarget: async () => ({ ok: true }), cancelPending() {} },
        new NullLogger(),
        { resetCaptured() {}, resetPresence() {}, setPresence() {}, markCaptured() {} },
        session.duality,
        session.manager,
        session.bus,
        session.buttons,
        { setScreenVisibility() {} },
        { compose: async () => canvas() },
        { getUserAvatar: async () => '' },
        session.gate,
        {},
        media,
        { create: () => canvas() },
        session.engine,
        true,
        session.timeline,
      );
      camera.boot();
      await camera.open({ offsetParent: {} });
      await flushEvents();
      await flushEvents();
      assert.equal(session.buttons.isActive('capture-btn', 'camera'), true);
      await camera.captureOverlay(session.duality.getQuestOverlay());
      await session.bus.settled();
      camera.closeSession();
      await session.enter();
      await session.post('guide.user.reply4');
      const saved = session.history.load('guide');
      assert.equal(saved.filter((row) => row.type === 'image' && row.media?.id).length, 1);
      camera.dispose();
      camera = null;
      session.dispose();
      session = recoverySession(storage, database);
      await session.enter();
      await session.switchTo('guest1');
      await session.switchTo('guide');
      assert.deepEqual(session.history.load('guide'), saved);
      await session.cameraReturn();
      await session.post('guide.user.reply5');
      const completed = session.history.load('guide');
      session.dispose();
      session = recoverySession(storage, database);
      await session.enter();
      await session.switchTo('guest1');
      await session.switchTo('guide');
      assert.deepEqual(session.history.load('guide'), completed);
      assert.equal(session.buttons.isActive('post', 'messenger'), false);
    } finally {
      camera?.dispose();
      media.dispose();
      session.dispose();
      await database.dispose();
    }
  });

  it('retains a pending post lock through widget readiness and ignores a rapid second post', async () => {
    const storage = persistence(),
      database = await openDatabase(storage),
      waiting = deferred();
    let holdAvatar = false;
    const session = recoverySession(storage, database, 'guide', {
      getUserAvatar: () => (holdAvatar ? waiting.promise : Promise.resolve('')),
    });
    try {
      await session.enter();
      holdAvatar = true;
      session.bus.emit({ type: 'post' });
      session.bus.emit({ type: DIALOG_WIDGET_READY });
      session.bus.emit({ type: 'post' });
      waiting.resolve('');
      await session.bus.settled();
      assert.deepEqual(
        session.history
          .load('guide')
          .filter((row) => row.author === 'user')
          .map((row) => row.text),
        ['guide.user.reply1'],
      );
      assert.equal(session.buttons.isActive('post', 'messenger'), true);
    } finally {
      waiting.resolve('');
      session.dispose();
      await database.dispose();
    }
  });

  it('cancels an avatar-delayed post on camera departure and permits a fresh post after return', async () => {
    const storage = persistence(),
      database = await openDatabase(storage),
      waiting = deferred();
    let holdAvatar = false;
    const session = recoverySession(storage, database, 'guide', {
      getUserAvatar: () => (holdAvatar ? waiting.promise : Promise.resolve('')),
    });
    try {
      await session.enter();
      holdAvatar = true;
      session.bus.emit({ type: 'post' });
      session.bus.emit({ type: 'SCREEN_CHANGE', screen: 'camera' });
      session.bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
      session.bus.emit({ type: DIALOG_WIDGET_READY });
      waiting.resolve('');
      await session.bus.settled();
      holdAvatar = false;
      assert.equal(session.history.load('guide').filter((row) => row.author === 'user').length, 0);
      await session.post('guide.user.reply1');
    } finally {
      waiting.resolve('');
      session.dispose();
      await database.dispose();
    }
  });
});
