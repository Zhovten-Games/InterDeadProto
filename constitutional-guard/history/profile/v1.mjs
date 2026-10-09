import { assert, openDatabase, runDriver } from '../../driver-tools.mjs';
import LocalStorageAdapter from '../../../proto-dev/src/storage/browser/local-storage-adapter.js';
import ProfileRegistration from '../../../proto-dev/src/identity/application/profile-registration-service.js';
import ProfileTransfer from '../../../proto-dev/src/identity/application/profile-transfer-service.js';
import GhostService from '../../../proto-dev/src/spirit-contacts/application/ghost-service.js';
import GhostSwitchService from '../../../proto-dev/src/spirit-contacts/application/ghost-switch-service.js';
import DialogRepository from '../../../proto-dev/src/messenger/persistence/dialog-repository.js';
import DialogHistory from '../../../proto-dev/src/messenger/history/dialog-history-service.js';
import EventBus from '../../../proto-dev/src/runtime-events/adapters/event-bus-adapter.js';
import {
  PROFILE_IMPORT_SELECTED,
  PROFILE_IMPORT_COMPLETED,
  PROFILE_TRANSFER_FAILED,
} from '../../../proto-dev/src/runtime-events/domain/constants.js';

await runDriver(
  [
    'profile.legacy-import',
    'profile.atomic-quota-refusal',
    'profile.invalid-snapshot',
    'profile.progress-export',
    'profile.immutable-backup',
    'profile.portable-export',
  ],
  async () => {
    const records = new Map([['host-unrelated', 'retained']]);
    let refuseEnvelope = false;
    const externalStorage = {
      get length() {
        return records.size;
      },
      key: (index) => [...records.keys()][index],
      getItem: (key) => records.get(key) ?? null,
      removeItem: (key) => records.delete(key),
      setItem(key, value) {
        if (refuseEnvelope && key === 'interdead:user-context:v1')
          throw new Error('Quota exceeded');
        records.set(key, value);
      },
    };
    const storage = new LocalStorageAdapter(externalStorage),
      database = await openDatabase(storage);
    const bus = new EventBus(),
      events = [];
    bus.subscribe((event) => events.push(event));
    const original = {
      name: 'Original',
      created_at: '2025-01-01',
      avatar: 'data:image/png;base64,b2xk',
    };
    await database.saveUser(original);
    const repository = new DialogRepository(database);
    repository.boot();
    const history = new DialogHistory(repository);
    history.appendUnique('guide', [
      { fingerprint: 'original', author: 'user', text: 'retained', timestamp: 0 },
    ]);
    const before = storage.load('sqlite_db');
    let imported = {
      schemaVersion: 1,
      profile: { name: 'Imported', created_at: '2025-02-01', avatar: 'data:image/png;base64,bmV3' },
      ghosts: {
        guide: {
          posts: [{ content: 'post' }],
          dialog: [
            { fingerprint: 'imported', author: 'ghost', text: 'hello', timestamp: 0, sequence: 1 },
          ],
        },
      },
      meta: {
        currentGhost: 'guide',
        progress: { 'quest:find-person': { completed: true }, ghostsCompleted: ['guide'] },
        uiPreferences: { membraneDisabled: true },
      },
    };
    let exported;
    const encrypted = {
      decrypt: async () => imported,
      encrypt: async (value) => {
        exported = value;
        return new TextEncoder().encode(JSON.stringify(value));
      },
    };
    const profile = new ProfileRegistration(database, encrypted, { info() {}, error() {} }, bus);
    const ghosts = new GhostService(storage),
      switching = new GhostSwitchService(storage, bus);
    const transfer = new ProfileTransfer(
      profile,
      null,
      history,
      ghosts,
      bus,
      { error() {} },
      storage,
      [switching],
    );
    transfer.boot();
    try {
      refuseEnvelope = true;
      bus.emit({ type: PROFILE_IMPORT_SELECTED, payload: { buffer: new ArrayBuffer(1) } });
      await bus.settled();
      assert.ok(events.some((event) => event.type === PROFILE_TRANSFER_FAILED));
      assert.equal(storage.load('sqlite_db'), before);
      assert.equal((await database.loadUser()).name, 'Original');
      assert.equal(profile.name, '');
      assert.equal(history.load('guide')[0].fingerprint, 'original');
      const backup = storage.load('sqlite_db_backup_before_profile_import');
      assert.equal(backup, before);
      refuseEnvelope = false;
      bus.emit({ type: PROFILE_IMPORT_SELECTED, payload: { buffer: new ArrayBuffer(1) } });
      await bus.settled();
      assert.ok(events.some((event) => event.type === PROFILE_IMPORT_COMPLETED));
      assert.equal((await database.loadUser()).name, 'Imported');
      assert.equal(history.load('guide')[0].timestamp, 0);
      assert.equal(storage.load('profile:ui-preferences').membraneDisabled, true);
      assert.equal(switching.isCompleted('guide'), true);
      assert.deepEqual(storage.exportUserProgress(), imported.meta.progress);
      assert.equal(records.get('host-unrelated'), 'retained');
      const userBeforeExport = await database.loadUser();
      const portableBefore = database.exportSnapshot();
      await profile.exportProfile('controlled external encryption fixture');
      assert.equal(exported.profile.name, 'Imported');
      assert.equal(exported.profile.created_at, userBeforeExport.created_at);
      assert.equal((await database.loadUser()).id, userBeforeExport.id);
      const portable = database.fork(exported.storageSnapshot);
      assert.equal(portable.fetchAll('SELECT * FROM exports').length, 0);
      assert.equal(portable.fetchAll('SELECT * FROM dialog_messages')[0].fingerprint, 'imported');
      portable.db.close();
      for (let repeat = 0; repeat < 3; repeat += 1) {
        await profile.exportProfile('controlled external encryption fixture');
        assert.ok(exported.storageSnapshot.length <= portableBefore.length);
        assert.equal((await database.loadUser()).id, userBeforeExport.id);
      }
      const saved = storage.load('sqlite_db');
      const context = storage.exportUserProgress();
      imported = { ...imported, storageSnapshot: btoa('invalid sqlite') };
      bus.emit({ type: PROFILE_IMPORT_SELECTED, payload: { buffer: new ArrayBuffer(1) } });
      await bus.settled();
      assert.equal(storage.load('sqlite_db'), saved);
      assert.deepEqual(storage.exportUserProgress(), context);
      assert.equal(storage.load('sqlite_db_backup_before_profile_import'), backup);
      storage.clear();
      assert.equal(storage.load('userId'), null);
      assert.equal(storage.load('sqlite_db'), null);
      assert.equal(storage.load('sqlite_db_backup_before_profile_import'), backup);
      assert.equal(records.get('host-unrelated'), 'retained');
    } finally {
      transfer.dispose();
      await database.dispose();
    }
  },
);
