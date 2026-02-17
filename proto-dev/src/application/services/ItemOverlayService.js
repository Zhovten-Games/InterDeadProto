/**
 * Composes a cropped item onto a background layer using canvas.
 * The service extracts a region from the selfie blob and
 * positions it according to quest configuration coordinates.
 */
export default class ItemOverlayService {
  /**
   * @param {import('../../ports/ICanvasFactory.js').default} canvasFactory
   */
  constructor(canvasFactory) {
    this.canvasFactory = canvasFactory;
  }

  /**
   * Create a composed layer.
   * @param {Blob|null} blob - Source selfie image.
   * @param {HTMLImageElement|HTMLCanvasElement|null} background - Background layer.
   * @param {object} coords - Positioning data `{ x, y, width, height, srcX, srcY, srcWidth, srcHeight }`.
   * @param {object|null} mask - Optional polygon points or ImageData defining the contour.
   * @param {object} [options] - Composition options.
   * @param {boolean} [options.includeFrame=true] - Whether to draw the selfie frame.
   * @returns {Promise<HTMLCanvasElement>} Canvas containing the composed scene.
   */
  async compose(blob, background = null, coords = {}, mask = null, options = {}) {
    const includeFrame = options.includeFrame !== false;
    const compositionMode = this._resolveCompositionMode(options.compositionMode);
    const img = includeFrame && blob ? await this._blobToImage(blob) : null;
    const canvas = this.canvasFactory.create();
    const dimensions = this._resolveCanvasDimensions({
      compositionMode,
      background,
      coords,
      img
    });
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;
    canvas.width = Math.max(1, canvasWidth);
    canvas.height = Math.max(1, canvasHeight);
    const ctx = canvas.getContext('2d');
    if (background) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
    if (!includeFrame || !img) {
      return canvas;
    }
    const {
      x = 0,
      y = 0,
      srcX = 0,
      srcY = 0,
      srcWidth = img.width,
      srcHeight = img.height
    } = coords;
    const width = compositionMode === 'detected-only' ? srcWidth : (coords.width ?? img.width);
    const height = compositionMode === 'detected-only' ? srcHeight : (coords.height ?? img.height);

    const off = this.canvasFactory.create();
    off.width = srcWidth;
    off.height = srcHeight;
    const octx = off.getContext('2d');
    octx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);

    if (mask) {
      let adj = mask;
      if (mask.polygon) {
        adj = { ...mask, polygon: mask.polygon.map(pt => ({ x: pt.x - srcX, y: pt.y - srcY })) };
      } else if (mask.imageData) {
        const cropped = this._cropImageData(mask.imageData, srcX, srcY, srcWidth, srcHeight);
        adj = { imageData: cropped };
      }
      this._applyMask(octx, adj, srcWidth, srcHeight);
    }

    ctx.drawImage(off, 0, 0, srcWidth, srcHeight, x, y, width, height);
    return canvas;
  }

  _resolveCompositionMode(mode) {
    const supportedModes = new Set(['collage', 'background-only', 'detected-only']);
    return supportedModes.has(mode) ? mode : 'collage';
  }

  _resolveCanvasDimensions({ compositionMode, background, coords, img }) {
    if (compositionMode === 'detected-only') {
      const srcWidth = coords.srcWidth ?? img?.width ?? 0;
      const srcHeight = coords.srcHeight ?? img?.height ?? 0;
      const x = coords.x ?? 0;
      const y = coords.y ?? 0;
      return {
        width: Math.max(1, x + Math.max(1, srcWidth), coords.canvasWidth || 0),
        height: Math.max(1, y + Math.max(1, srcHeight), coords.canvasHeight || 0)
      };
    }
    return {
      width: Math.max(1, background?.width || coords.canvasWidth || coords.width || img?.width || 0),
      height: Math.max(1, background?.height || coords.canvasHeight || coords.height || img?.height || 0)
    };
  }

  /**
   * Apply polygon or image mask to context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} mask
   * @param {number} width
   * @param {number} height
   * @private
   */
  _applyMask(ctx, mask, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    if (Array.isArray(mask.polygon)) {
      ctx.beginPath();
      const [first, ...rest] = mask.polygon;
      if (first) {
        ctx.moveTo(first.x, first.y);
        for (const pt of rest) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fill();
      }
    } else if (mask.imageData) {
      const mCanvas = this.canvasFactory.create();
      mCanvas.width = mask.imageData.width || width;
      mCanvas.height = mask.imageData.height || height;
      mCanvas.getContext('2d').putImageData(mask.imageData, 0, 0);
      ctx.drawImage(mCanvas, 0, 0, width, height);
    }
    ctx.restore();
  }

  _cropImageData(imageData, x, y, width, height) {
    const out = new Uint8ClampedArray(width * height * 4);
    const srcW = imageData.width;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const srcIdx = ((y + j) * srcW + (x + i)) * 4;
        const dstIdx = (j * width + i) * 4;
        out[dstIdx] = imageData.data[srcIdx];
        out[dstIdx + 1] = imageData.data[srcIdx + 1];
        out[dstIdx + 2] = imageData.data[srcIdx + 2];
        out[dstIdx + 3] = imageData.data[srcIdx + 3];
      }
    }
    return { data: out, width, height };
  }

  async _blobToImage(blob) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    });
  }
}
