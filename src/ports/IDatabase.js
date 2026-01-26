/**
 * Contract for database adapters wrapping SQL.js or other engines.
 */
export default class IDatabase {
  /**
   * Initialise the database connection and ensure schema availability.
   * @returns {Promise<void>}
   */
  async boot() {
    throw new Error('Method boot must be implemented by database adapters.');
  }

  /**
   * Execute a statement that may mutate state.
   * @param {string} sql
   * @param {Array<*>} [params]
   * @returns {Promise<void>}
   */
  async exec(sql, params = []) {
    throw new Error('Method exec must be implemented by database adapters.');
  }

  /**
   * Execute a statement without returning a value.
   * @param {string} sql
   * @param {Array<*>} [params]
   */
  run(sql, params = []) {
    throw new Error('Method run must be implemented by database adapters.');
  }

  /**
   * Fetch a single row.
   * @param {string} sql
   * @param {Array<*>} [params]
   * @returns {Promise<object|null>}
   */
  async get(sql, params = []) {
    throw new Error('Method get must be implemented by database adapters.');
  }

  /**
   * Fetch all rows for a query.
   * @param {string} sql
   * @param {Array<*>} [params]
   * @returns {Array<object>}
   */
  fetchAll(sql, params = []) {
    throw new Error('Method fetchAll must be implemented by database adapters.');
  }

  /**
   * Convenience alias for {@link exec}.
   * @param {string} sql
   * @param {Array<*>} [params]
   * @returns {Promise<void>}
   */
  async executeQuery(sql, params = []) {
    throw new Error('Method executeQuery must be implemented by database adapters.');
  }

  /**
   * Persist a user profile.
   * @param {object} profile
   * @returns {Promise<void>}
   */
  async saveUser(profile) {
    throw new Error('Method saveUser must be implemented by database adapters.');
  }

  /**
   * Load the latest user profile.
   * @returns {Promise<object|null>}
   */
  async loadUser() {
    throw new Error('Method loadUser must be implemented by database adapters.');
  }

  /**
   * Store an encrypted export blob.
   * @param {Uint8Array} blob
   * @returns {Promise<void>}
   */
  async recordExport(blob) {
    throw new Error('Method recordExport must be implemented by database adapters.');
  }

  /**
   * Persist a location record.
   * @param {object} data
   * @returns {Promise<void>}
   */
  async saveLocation(data) {
    throw new Error('Method saveLocation must be implemented by database adapters.');
  }

  /**
   * Persist a selfie entry.
   * @param {object} data
   * @returns {Promise<void>}
   */
  async saveSelfie(data) {
    throw new Error('Method saveSelfie must be implemented by database adapters.');
  }

  /**
   * Remove all persisted records.
   * @returns {Promise<void>}
   */
  async clearAll() {
    throw new Error('Method clearAll must be implemented by database adapters.');
  }
}
