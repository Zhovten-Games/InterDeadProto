import assert from 'assert';
import ProfileTransferService from '../../../src/application/services/ProfileTransferService.js';
import {
  PROFILE_EXPORT_CONFIRMED,
  PROFILE_EXPORT_READY,
  PROFILE_IMPORT_SELECTED,
  PROFILE_IMPORT_COMPLETED,
  PROFILE_TRANSFER_FAILED
} from '../../../src/core/events/constants.js';

class StubBus {
  constructor() {
    this.handlers = [];
    this.events = [];
  }

  subscribe(handler) {
    this.handlers.push(handler);
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emit(evt) {
    this.events.push(evt);
    this.handlers.slice().forEach(handler => handler(evt));
  }
}

describe('ProfileTransferService', () => {
  let bus;
  let profileService;
  let postsService;
  let historyService;
  let ghostService;
  let logger;
  let service;

  beforeEach(() => {
    bus = new StubBus();
    profileService = {
      exportProfileCalls: [],
      importProfile: async (file, password) => ({
        profile: { name: 'Imported', created_at: '2025-01-01T00:00:00Z' },
        ghosts: {
          guide: {
            posts: [{ content: 'hello', created_at: '2025-01-02T00:00:00Z' }],
            dialog: [{ author: 'ghost', text: 'boo', timestamp: 1, order: 1 }]
          }
        },
        meta: { currentGhost: 'guide' }
      }),
      exportProfile: async (password, extras) => {
        profileService.exportProfileCalls.push({ password, extras });
        return new Uint8Array([1, 2, 3]);
      }
    };
    postsService = {
      exported: {},
      imported: null,
      async exportAllByGhost() {
        return this.exported;
      },
      async replaceAllByGhost(map) {
        this.imported = map;
      }
    };
    historyService = {
      exported: {},
      replaced: null,
      exportAll() {
        return this.exported;
      },
      replaceAll(map) {
        this.replaced = map;
      }
    };
    ghostService = {
      current: 'guide',
      defaultGhost: 'guide',
      getCurrentGhost() {
        return { name: this.current };
      },
      setCurrentGhost(name) {
        this.current = name;
      }
    };
    logger = { error() {}, warn() {} };
    service = new ProfileTransferService(
      profileService,
      postsService,
      historyService,
      ghostService,
      bus,
      logger
    );
    service.boot();
  });

  afterEach(() => {
    service.dispose();
  });

  it('collects ghost data and emits PROFILE_EXPORT_READY on export confirm', async () => {
    postsService.exported = {
      guide: [{ content: 'post', created_at: '2024-12-12T12:00:00Z' }]
    };
    historyService.exported = {
      guide: [{ author: 'ghost', text: 'hi', timestamp: 5, order: 1 }]
    };

    bus.emit({ type: PROFILE_EXPORT_CONFIRMED, payload: { password: 'secret' } });

    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(profileService.exportProfileCalls.length, 1);
    const call = profileService.exportProfileCalls[0];
    assert.strictEqual(call.password, 'secret');
    assert.deepStrictEqual(call.extras.meta.currentGhost, 'guide');
    assert.deepStrictEqual(call.extras.ghosts.guide.posts.length, 1);
    assert.deepStrictEqual(call.extras.ghosts.guide.dialog.length, 1);

    const readyEvent = bus.events.find(evt => evt.type === PROFILE_EXPORT_READY);
    assert.ok(readyEvent, 'export ready event emitted');
    assert.ok(readyEvent.payload.blob instanceof Uint8Array);
  });

  it('imports posts and dialog then emits PROFILE_IMPORT_COMPLETED', async () => {
    const buffer = new ArrayBuffer(4);
    bus.emit({ type: PROFILE_IMPORT_SELECTED, payload: { buffer, password: 'pw' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.deepStrictEqual(postsService.imported, {
      guide: [{ content: 'hello', created_at: '2025-01-02T00:00:00Z' }]
    });
    assert.deepStrictEqual(historyService.replaced, {
      guide: [{ author: 'ghost', text: 'boo', timestamp: 1, order: 1 }]
    });
    assert.strictEqual(ghostService.current, 'guide');

    const completed = bus.events.find(evt => evt.type === PROFILE_IMPORT_COMPLETED);
    assert.ok(completed, 'import completed event emitted');
  });

  it('emits PROFILE_TRANSFER_FAILED when import payload invalid', async () => {
    bus.emit({ type: PROFILE_IMPORT_SELECTED, payload: { buffer: null } });
    await new Promise(resolve => setTimeout(resolve, 0));

    const failure = bus.events.find(evt => evt.type === PROFILE_TRANSFER_FAILED);
    assert.ok(failure, 'failure event emitted');
    assert.strictEqual(failure.payload.operation, 'import');
  });
});
