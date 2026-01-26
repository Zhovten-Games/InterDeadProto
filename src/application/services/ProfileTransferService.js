import NullEventBus from '../../core/events/NullEventBus.js';
import {
  PROFILE_IMPORT_SELECTED,
  PROFILE_IMPORT_COMPLETED,
  PROFILE_EXPORT_CONFIRMED,
  PROFILE_EXPORT_READY,
  PROFILE_TRANSFER_FAILED
} from '../../core/events/constants.js';

export default class ProfileTransferService {
  constructor(
    profileService,
    postsService,
    historyService,
    ghostService,
    bus = new NullEventBus(),
    logger = console
  ) {
    this.profileService = profileService;
    this.postsService = postsService;
    this.historyService = historyService;
    this.ghostService = ghostService;
    this.bus = bus;
    this.logger = logger;
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
          dialog: messages
        };
      });
      const ghostEntries = {};
      Object.entries(combined).forEach(([ghost, data]) => {
        const posts = Array.isArray(data.posts) ? data.posts : Array.isArray(data) ? data : [];
        const dialog = Array.isArray(data.dialog) ? data.dialog : [];
        ghostEntries[ghost] = { posts, dialog };
      });
      const meta = {
        currentGhost: this.ghostService?.getCurrentGhost?.()?.name || null
      };
      const encrypted = await this.profileService.exportProfile(password, {
        ghosts: ghostEntries,
        meta
      });
      this.bus.emit({
        type: PROFILE_EXPORT_READY,
        payload: { blob: encrypted, meta }
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
        arrayBuffer: async () => buffer
      };
      const data = await this.profileService.importProfile(fileLike, password);
      const ghosts = data?.ghosts || {};
      const meta = data?.meta || {};
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
      await this.postsService?.replaceAllByGhost?.(postsByGhost);
      this.historyService?.replaceAll?.(
        Object.entries(dialogByGhost).reduce((acc, [ghost, messages]) => {
          acc[ghost] = messages;
          return acc;
        }, {})
      );
      const nextGhost = meta.currentGhost || this.ghostService?.defaultGhost;
      if (nextGhost && this.ghostService?.setCurrentGhost) {
        this.ghostService.setCurrentGhost(nextGhost);
      }
      this.bus.emit({
        type: PROFILE_IMPORT_COMPLETED,
        payload: { ghosts: Object.keys(ghosts) }
      });
    } catch (err) {
      this._reportFailure('import', err);
    }
  }

  _reportFailure(operation, err) {
    const message = err?.message || String(err);
    this.logger?.error?.(`ProfileTransferService: ${operation} failed - ${message}`);
    this.bus.emit({
      type: PROFILE_TRANSFER_FAILED,
      payload: { operation, message }
    });
  }
}
