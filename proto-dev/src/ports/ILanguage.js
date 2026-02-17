/**
 * Contract for language management services coordinating localisation.
 */
export default class ILanguage {
  /**
   * Prepare language resources and subscribe to events.
   * @returns {Promise<void>|void}
   */
  async boot() {
    throw new Error('Method boot must be implemented by language adapters.');
  }

  /**
   * Release any resources and unsubscribe from events.
   */
  dispose() {
    throw new Error('Method dispose must be implemented by language adapters.');
  }

  /**
   * Dynamically load locales for a ghost.
   * @param {string} ghostName
   * @returns {Promise<void>}
   */
  async addGhostLocales(ghostName) {
    throw new Error('Method addGhostLocales must be implemented by language adapters.');
  }

  /**
   * Change active language and persist selection.
   * @param {string} code Language code.
   */
  setLanguage(code) {
    throw new Error('Method setLanguage must be implemented by language adapters.');
  }

  /**
   * Apply translations to a DOM container.
   * @param {ParentNode} container
   * @returns {Promise<void>}
   */
  async applyLanguage(container) {
    throw new Error('Method applyLanguage must be implemented by language adapters.');
  }

  /**
   * Translate a key within a domain.
   * @param {string} key
   * @param {string} [domain]
   * @returns {Promise<string>}
   */
  async translate(key, domain) {
    throw new Error('Method translate must be implemented by language adapters.');
  }
}
