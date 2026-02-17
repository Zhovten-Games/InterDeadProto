import NullEventBus from '../../core/events/NullEventBus.js';
import { APP_RESET_COMPLETED, USER_PROFILE_SAVED } from '../../core/events/constants.js';

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
    this._resetHandler = evt => {
      if (evt?.type === APP_RESET_COMPLETED) {
        this._handleReset();
      }
    };
    this.bus?.subscribe?.(this._resetHandler);
  }

  setName(name) {
    this.name = name;
  }

  setAvatar(data) {
    this.avatar = data;
    const len = data ? data.length : 0;
    this.logger?.info?.(
      `ProfileRegistrationService: avatar set (${len} bytes)`
    );
  }

  async importProfile(file, password) {
    try {
      const array = new Uint8Array(await file.arrayBuffer());
      const data = await this.enc.decrypt(array, password);
      const profile = data?.profile || data;
      await this.db.saveUser({
        name: profile.name,
        created_at: profile.created_at,
        avatar: profile.avatar || null
      });
      this.name = profile.name;
      this.avatar = profile.avatar || null;
      this.stateService?.setLocalAuthReady?.(true);
      this._imported = true;
      this.logger?.info(`ProfileRegistrationService: imported profile, name=${this.name}`);
      return data;
    } catch (err) {
      this.logger?.error(`Import failed: ${err.message}`);
      throw err;
    }
  }

  async exportProfile(password, extras = {}) {
    try {
      const profile = {
        name: this.name,
        created_at: new Date().toISOString(),
        avatar: this.avatar
      };
      await this.db.saveUser(profile);
      const payload = {
        profile,
        ghosts: extras.ghosts || {},
        meta: extras.meta || {}
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
      `ProfileRegistrationService: saving profile, avatar length ${this.avatar.length}`
    );
    const profile = {
      name: this.name,
      created_at: new Date().toISOString(),
      avatar: this.avatar
    };
    this.stateService?.setPresence?.('person', true);
    this.stateService?.setLocalAuthReady?.(true);
    await this.db.saveUser(profile);
    this.logger?.info(`Profile saved: ${this.name}`);
    this.bus?.emit?.({ type: USER_PROFILE_SAVED, avatar: this.avatar });
  }

  canProceed() {
    return Boolean(this.name) || this._imported || this._exported;
  }

  _handleReset() {
    this.name = '';
    this.avatar = null;
    this._imported = false;
    this._exported = false;
    this.stateService?.setLocalAuthReady?.(false);
  }

  dispose() {
    if (this._resetHandler) {
      this.bus?.unsubscribe?.(this._resetHandler);
      this._resetHandler = null;
    }
  }
}
