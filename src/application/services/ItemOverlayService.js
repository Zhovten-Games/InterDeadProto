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
   * @param {Blob} blob - Source selfie image.
   * @param {HTMLImageElement|HTMLCanvasElement|null} background - Background layer.
   * @param {object} coords - Positioning data `{ x, y, width, height, srcX, srcY, srcWidth, srcHeight }`.
   * @param {object|null} mask - Optional polygon points or ImageData defining the contour.
   * @returns {Promise<HTMLCanvasElement>} Canvas containing the composed scene.
   */
  async compose(blob, background = null, coords = {}, mask = null) {
    const img = await this._blobToImage(blob);
    const canvas = this.canvasFactory.create();
    canvas.width = background?.width || coords.canvasWidth || img.width;
    canvas.height = background?.height || coords.canvasHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (background) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }
    const {
      x = 0,
      y = 0,
      width = img.width,
      height = img.height,
      srcX = 0,
      srcY = 0,
      srcWidth = img.width,
      srcHeight = img.height
    } = coords;

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
