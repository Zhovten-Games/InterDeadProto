/**
 * Contract for panel rendering adapters that manage control surfaces.
 */
export default class IPanel {
  /**
   * Register event listeners.
   */
  boot() {
    throw new Error('Method boot must be implemented by panel adapters.');
  }

  /**
   * Load panel markup into the DOM.
   * @param {object} context
   * @returns {Promise<void>}
   */
  async load(context) {
    throw new Error('Method load must be implemented by panel adapters.');
  }

  /**
   * Update panel state for a given context.
   * @param {HTMLElement} container
   * @param {object} context
   * @returns {Promise<void>}
   */
  async update(container, context) {
    throw new Error('Method update must be implemented by panel adapters.');
  }
}
