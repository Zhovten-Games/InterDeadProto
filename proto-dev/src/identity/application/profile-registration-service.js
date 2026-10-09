import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import { USER_PROFILE_SAVED } from '../../runtime-events/domain/constants.js';

export default class ProfileRegistrationService {
  constructor(dbService, encryption, logger, bus = new NullEventBus(), stateService = null) {
    this.db = dbService;
    this.enc = encryption;
    this.logger = logger;
    this.bus = bus;
    this.stateService = stateService;
    this.name = '';
    this.avatar = null;
    this._imported = false;
    this._exported = false;
  }

  setName(name) {
    this.name = name;
  }

  setAvatar(data) {
    this.avatar = data;
    const len = data ? data.length : 0;
    this.logger?.info?.(`ProfileRegistrationService: avatar set (${len} bytes)`);
  }

  async prepareImport(file, password) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const data = await this.enc.decrypt(bytes, password);
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw new Error('Invalid profile object');
    if (data.schemaVersion !== undefined && ![1, 2].includes(data.schemaVersion))
      throw new Error('Unsupported profile version');
    const profile = data.profile || data;
    if (typeof profile.name !== 'string' || !profile.name.trim())
      throw new Error('Profile name is required');
    if (
      profile.avatar !== undefined &&
      profile.avatar !== null &&
      typeof profile.avatar !== 'string'
    )
      throw new Error('Invalid profile avatar');
    return {
      data,
      profile: {
        name: profile.name,
        created_at: profile.created_at || 'legacy:unknown',
        avatar: profile.avatar || null,
      },
    };
  }

  commitImportedContext(prepared) {
    this.name = prepared.profile.name;
    this.avatar = prepared.profile.avatar;
    this._imported = true;
    this.stateService?.setLocalAuthReady?.(true);
  }

  async importProfile(file, password) {
    const prepared = await this.prepareImport(file, password);
    await this.db.saveUser(prepared.profile);
    this.commitImportedContext(prepared);
    return prepared.data;
  }

  async exportProfile(password, extras = {}) {
    try {
      const existing = await this.db.loadUser?.();
      const profile = {
        name: this.name || existing?.name || '',
        created_at: existing?.created_at || new Date().toISOString(),
        avatar: this.avatar ?? existing?.avatar ?? null,
      };
      if (!profile.name.trim()) throw new Error('Profile name is required');
      if (
        !existing ||
        existing.name !== profile.name ||
        existing.avatar !== profile.avatar ||
        existing.created_at !== profile.created_at
      ) {
        await this.db.saveUser(profile);
      }
      const payload = {
        schemaVersion: 2,
        storageSnapshot: this.db.exportSnapshot?.() || null,
        profile,
        ghosts: extras.ghosts || {},
        meta: extras.meta || {},
      };
      const encrypted = await this.enc.encrypt(payload, password);
      await this.db.recordExport(encrypted);
      this._exported = true;
      this.logger?.info(`ProfileRegistrationService: exported profile, name=${this.name}`);
      return encrypted;
    } catch (err) {
      this.logger?.error(`Export failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Persist current profile into the database.
   * Stores name and creation timestamp and logs the operation.
   */
  async saveProfile() {
    if (!this.avatar) {
      const msg = 'ProfileRegistrationService: cannot save profile without avatar';
      this.logger?.warn?.(msg);
      throw new Error('Avatar is required');
    }
    this.logger?.info?.(
      `ProfileRegistrationService: saving profile, avatar length ${this.avatar.length}`,
    );
    const profile = {
      name: this.name,
      created_at: new Date().toISOString(),
      avatar: this.avatar,
    };
    await this.db.saveUser(profile);
    this.stateService?.setPresence?.('person', true);
    this.stateService?.setLocalAuthReady?.(true);
    this.logger?.info(`Profile saved: ${this.name}`);
    this.bus?.emit?.({ type: USER_PROFILE_SAVED, avatar: this.avatar });
  }

  canProceed() {
    return Boolean(this.name) || this._imported || this._exported;
  }

  clearUserRuntimeContext() {
    this._handleReset();
  }

  _handleReset() {
    this.name = '';
    this.avatar = null;
    this._imported = false;
    this._exported = false;
    this.stateService?.setLocalAuthReady?.(false);
  }

  dispose() {}
}
