/**
 * Contract for adapters applying visual effects to rendered views.
 */
export default class IVisualEffects {
  /**
   * Mount effect hooks into a container element.
   * @param {HTMLElement} container
   */
  mount(container) {
    throw new Error('Method mount must be implemented by visual effects adapters.');
  }

  /**
   * Apply an effect configuration by name.
   * @param {string} effectName
   * @param {object} config
   */
  applyEffect(effectName, config) {
    throw new Error('Method applyEffect must be implemented by visual effects adapters.');
  }

  /**
   * Remove a previously applied effect.
   * @param {string} effectName
   */
  clearEffect(effectName) {
    throw new Error('Method clearEffect must be implemented by visual effects adapters.');
  }

  /**
   * Remove all applied effects and clean up DOM state.
   */
  clearAll() {
    throw new Error('Method clearAll must be implemented by visual effects adapters.');
  }
}
