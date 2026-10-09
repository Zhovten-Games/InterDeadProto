/**
 * Contract for creating canvas instances for rendering pipelines.
 */
export default class ICanvasFactory {
  /**
   * Create a canvas element.
   * @param {number} [width=0]
   * @param {number} [height=0]
   * @returns {HTMLCanvasElement|OffscreenCanvas}
   */
  create(width = 0, height = 0) {
    throw new Error('Method create must be implemented by canvas factory adapters.');
  }
}
