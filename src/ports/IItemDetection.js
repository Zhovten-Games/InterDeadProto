/**
 * Contract for item detection services used in quests.
 */
export default class IItemDetection {
  /**
   * Analyse an image and return detected items.
   * @param {Blob|CanvasImageSource} image
   * @returns {Promise<Array<object>>}
   */
  async detectItems(image) {
    throw new Error('Method detectItems must be implemented by item detection adapters.');
  }
}
