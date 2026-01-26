import ICanvasFactory from '../../ports/ICanvasFactory.js';

export default class CanvasFactoryAdapter extends ICanvasFactory {
  /**
   * Create a canvas element.
   * OffscreenCanvas is intentionally avoided because it lacks
   * certain APIs such as `toDataURL` that the application relies on.
   * @param {number} [width=0]
   * @param {number} [height=0]
   * @returns {HTMLCanvasElement}
   */
  create(width = 0, height = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}
