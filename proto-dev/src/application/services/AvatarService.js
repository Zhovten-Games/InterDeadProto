import Service from '../../core/Service.js';

/**
 * Provides avatar data for user and ghosts.
 */
export default class AvatarService extends Service {
  constructor(database, logger = null) {
    super(logger);
    this.database = database;
  }

  /**
   * Load the most recent selfie for the user.
   * @returns {Promise<string|null>} base64 image data or null if none stored
   */
  async getUserAvatar() {
    try {
      const row = await this.database.get(
        'SELECT avatar FROM users ORDER BY id DESC LIMIT 1'
      );
      if (row?.avatar) {
        const sample = row.avatar.slice(0, 20);
        this.info(`User avatar retrieved: ${sample}`);
        return row.avatar;
      }
      this.warn('User avatar not found');
      return null;
    } catch (err) {
      this.warn(`User avatar lookup failed: ${err?.message || err}`);
      return null;
    }
  }
}
