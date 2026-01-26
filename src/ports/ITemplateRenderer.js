/**
 * Contract for HTML template rendering engines.
 */
export default class ITemplateRenderer {
  /**
   * Load a raw template by name.
   * @param {string} name Template identifier.
   * @returns {Promise<string>}
   */
  async loadTemplate(name) {
    throw new Error('Method loadTemplate must be implemented by template renderer adapters.');
  }

  /**
   * Apply data to a template string.
   * @param {string} template
   * @param {object} data
   * @returns {string}
   */
  fill(template, data) {
    throw new Error('Method fill must be implemented by template renderer adapters.');
  }

  /**
   * Load and render a named template.
   * @param {string} name
   * @param {object} data
   * @returns {Promise<string>}
   */
  async render(name, data) {
    throw new Error('Method render must be implemented by template renderer adapters.');
  }

  /**
   * Render into a specific DOM section.
   * @param {string|Element} sectionId
   * @param {string} name
   * @param {object} data
   * @returns {Promise<string>}
   */
  async renderSection(sectionId, name, data) {
    throw new Error('Method renderSection must be implemented by template renderer adapters.');
  }
}
