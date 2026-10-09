/**
 * Contract for object detection engines.
 */
export default class IDetection {
  /**
   * Run detection against an image-like source.
   * @param {CanvasImageSource|Blob} image Source to analyse.
   * @param {string} target Class name to locate.
   * @returns {Promise<object>}
   */
  async detectTarget(image, target) {
    throw new Error('Method detectTarget must be implemented by detection adapters.');
  }
}
