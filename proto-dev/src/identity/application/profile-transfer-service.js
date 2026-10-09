import DialogRepository from '../../messenger/persistence/dialog-repository.js';
import MediaRepository from '../../media/persistence/media-repository.js';
import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import {
  PROFILE_IMPORT_SELECTED,
  PROFILE_IMPORT_COMPLETED,
  PROFILE_EXPORT_CONFIRMED,
  PROFILE_EXPORT_READY,
  PROFILE_TRANSFER_FAILED,
} from '../../runtime-events/domain/constants.js';

import {
  PROFILE_UI_PREFERENCES_KEY,
  normalizeProfileUiPreferences,
} from '../configuration/profile-ui-preferences-config.js';

export default class ProfileTransferService {
  constructor(
    profileService,
    postsService,
    historyService,
    ghostService,
    bus = new NullEventBus(),
    logger = console,
    persistence = null,
    contextConsumers = [],
    allowedGhosts = [],
  ) {
    this.profileService = profileService;
    this.postsService = postsService;
    this.historyService = historyService;
    this.ghostService = ghostService;
    this.bus = bus;
    this.logger = logger;
    this.persistence = persistence;
    this.contextConsumers = contextConsumers;
    this.allowedGhosts = new Set(allowedGhosts);
    this._handler = this._handleEvent.bind(this);
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this.bus.subscribe(this._handler);
    this._booted = true;
  }

  dispose() {
    if (!this._booted) return;
    this.bus.unsubscribe(this._handler);
    this._booted = false;
  }

  async _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === PROFILE_EXPORT_CONFIRMED) {
      await this._handleExport(evt.payload || {});
    }
    if (evt.type === PROFILE_IMPORT_SELECTED) {
      await this._handleImport(evt.payload || {});
    }
  }

  async _handleExport(payload) {
    try {
      const password = payload.password || '';
      const ghosts = await this.postsService?.exportAllByGhost?.();
      const histories = this.historyService?.exportAll?.() || {};
      const combined = { ...ghosts };
      Object.entries(histories || {}).forEach(([ghost, messages]) => {
        if (!combined[ghost]) combined[ghost] = {};
        combined[ghost] = {
          ...(typeof combined[ghost] === 'object' && !Array.isArray(combined[ghost])
            ? combined[ghost]
            : { posts: combined[ghost] || [] }),
          dialog: messages,
        };
      });
      const ghostEntries = {};
      Object.entries(combined).forEach(([ghost, data]) => {
        let posts = [];
        if (Array.isArray(data.posts)) posts = data.posts;
        else if (Array.isArray(data)) posts = data;
        const dialog = Array.isArray(data.dialog) ? data.dialog : [];
        ghostEntries[ghost] = { posts, dialog };
      });
      const meta = {
        currentGhost: this.ghostService?.getCurrentGhost?.()?.name || null,
        uiPreferences: this._loadUiPreferences(),
        progress: this.persistence?.exportUserProgress?.() || {},
      };
      const encrypted = await this.profileService.exportProfile(password, {
        ghosts: ghostEntries,
        meta,
      });
      this.bus.emit({
        type: PROFILE_EXPORT_READY,
        payload: { blob: encrypted, meta },
      });
    } catch (err) {
      this._reportFailure('export', err);
    }
  }

  async _handleImport(payload) {
    try {
      const { buffer, password = '' } = payload;
      if (!(buffer instanceof ArrayBuffer)) {
        throw new Error('Invalid profile payload');
      }
      const fileLike = {
        arrayBuffer: async () => buffer,
      };
      const atomic =
        typeof this.profileService.prepareImport === 'function' &&
        typeof this.profileService.db?.fork === 'function';
      const prepared = atomic ? await this.profileService.prepareImport(fileLike, password) : null;
      const data = prepared?.data || (await this.profileService.importProfile(fileLike, password));
      const ghosts = data?.ghosts || {};
      const meta = data?.meta || {};
      if (
        !ghosts ||
        Array.isArray(ghosts) ||
        typeof ghosts !== 'object' ||
        !meta ||
        Array.isArray(meta) ||
        typeof meta !== 'object'
      )
        throw new Error('Invalid profile sections');
      if (
        this.allowedGhosts.size &&
        (Object.keys(ghosts).some((name) => !this.allowedGhosts.has(name)) ||
          (meta.currentGhost && !this.allowedGhosts.has(meta.currentGhost)))
      )
        throw new Error('Unknown spirit in imported profile');
      const preferences = normalizeProfileUiPreferences(meta.uiPreferences);
      const progress = meta.progress || {};
      if (
        !progress ||
        Array.isArray(progress) ||
        typeof progress !== 'object' ||
        Object.keys(progress).some(
          (key) =>
            !/^(?:duality:|quest:|ghostsCompleted$|ghost-switch:|reactions:|checkpoint:)/.test(key),
        )
      )
        throw new Error('Invalid profile progress');
      if (
        progress.ghostsCompleted &&
        (!Array.isArray(progress.ghostsCompleted) ||
          progress.ghostsCompleted.some((name) => typeof name !== 'string'))
      )
        throw new Error('Invalid completed spirits');
      if (
        meta.currentGhost !== undefined &&
        meta.currentGhost !== null &&
        typeof meta.currentGhost !== 'string'
      )
        throw new Error('Invalid current spirit');
      const postsByGhost = {};
      const dialogByGhost = {};
      Object.entries(ghosts).forEach(([ghost, section]) => {
        if (Array.isArray(section?.posts)) {
          postsByGhost[ghost] = section.posts;
        }
        if (Array.isArray(section?.dialog)) {
          dialogByGhost[ghost] = section.dialog;
        }
      });
      if (atomic) {
        const database = this.profileService.db;
        const candidate = database.fork(data.storageSnapshot || null);
        try {
          const repository = new DialogRepository(candidate);
          repository.ensureSchema();
          new MediaRepository(candidate).boot();
          if (!data.storageSnapshot) {
            candidate.transaction(() => {
              for (const table of ['users', 'posts', 'locations', 'selfies', 'exports', 'media'])
                candidate.run(`DELETE FROM ${table}`);
              candidate.run('INSERT INTO users(name,created_at,avatar) VALUES(?,?,?)', [
                prepared.profile.name,
                prepared.profile.created_at,
                prepared.profile.avatar,
              ]);
              const userId = candidate.fetchAll('SELECT last_insert_rowid() AS id')[0].id;
              for (const [ghost, posts] of Object.entries(postsByGhost))
                for (const post of posts) {
                  if (typeof post.content !== 'string') throw new Error('Invalid imported post');
                  candidate.run(
                    'INSERT INTO posts(user_id,ghost_type,content,created_at) VALUES(?,?,?,?)',
                    [userId, ghost, post.content, post.created_at || 'legacy:unknown'],
                  );
                }
              const histories = Object.fromEntries(
                Object.entries(dialogByGhost).map(([ghost, messages]) => [
                  ghost,
                  this.historyService.prepareImport(ghost, messages),
                ]),
              );
              repository.replaceAll(histories);
            });
          }
          const user = candidate.fetchAll('SELECT * FROM users ORDER BY id DESC LIMIT 1')[0];
          if (!user || user.name !== prepared.profile.name || typeof user.created_at !== 'string')
            throw new Error('Snapshot/profile identity mismatch');
          for (const table of [
            'users',
            'posts',
            'locations',
            'selfies',
            'exports',
            'media',
            'dialog_messages',
          ])
            candidate.fetchAll(`SELECT * FROM ${table} LIMIT 0`);
          const nextGhost = meta.currentGhost || this.ghostService?.defaultGhost;
          database.commitSnapshot(candidate, 'sqlite_db_backup_before_profile_import', {
            ...progress,
            userId: String(user.id),
            captured: !!user.avatar,
            ghostType: nextGhost || null,
            [PROFILE_UI_PREFERENCES_KEY]: preferences,
          });
        } catch (error) {
          candidate.db.close();
          throw error;
        }
        this.historyService.clearUserRuntimeContext?.();
        this.profileService.commitImportedContext(prepared);
        for (const consumer of this.contextConsumers) consumer?.restoreUserContext?.();
      } else {
        // Compatibility with the declared profile-only port; full production
        // composition always supplies the atomic snapshot/database boundary.
        await this.postsService?.replaceAllByGhost?.(postsByGhost);
        this.historyService?.replaceAll?.(
          Object.entries(dialogByGhost).reduce((acc, [ghost, messages]) => {
            acc[ghost] = messages;
            return acc;
          }, {}),
        );
      }
      if (!atomic) this._persistUiPreferences(preferences);
      const nextGhost = meta.currentGhost || this.ghostService?.defaultGhost;
      if (nextGhost && this.ghostService?.setCurrentGhost) {
        this.ghostService.setCurrentGhost(nextGhost);
        this.bus.emit({ type: 'GHOST_CHANGE', payload: { name: nextGhost } });
      }
      this.bus.emit({
        type: PROFILE_IMPORT_COMPLETED,
        payload: { ghosts: Object.keys(ghosts), preferences },
      });
    } catch (err) {
      this._reportFailure('import', err);
    }
  }

  _persistUiPreferences(preferences) {
    if (!this.persistence) return;
    this.persistence.save?.(PROFILE_UI_PREFERENCES_KEY, normalizeProfileUiPreferences(preferences));
  }

  _loadUiPreferences() {
    if (!this.persistence) return normalizeProfileUiPreferences();
    const stored = this.persistence.load?.(PROFILE_UI_PREFERENCES_KEY);
    return normalizeProfileUiPreferences(stored);
  }

  _reportFailure(operation, err) {
    const message = err?.message || String(err);
    this.logger?.error?.(`ProfileTransferService: ${operation} failed - ${message}`);
    this.bus.emit({
      type: PROFILE_TRANSFER_FAILED,
      payload: { operation, message },
    });
  }
}
