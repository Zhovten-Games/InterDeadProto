/**
 * Composes camera frames with optional background and overlay images.
 * Sources may be provided as drawable elements, blobs, or URLs.
 */
export default class ImageComposerService {
  /**
   * @param {import('../../ports/ICanvasFactory.js').default} canvasFactory Factory producing drawing surfaces.
   */
  constructor(canvasFactory) {
    if (!canvasFactory || typeof canvasFactory.create !== 'function') {
      throw new TypeError('ImageComposerService requires a canvas factory implementing ICanvasFactory.');
    }
    this.canvasFactory = canvasFactory;
  }

  async compose({ frame, crop = {}, background = null, overlays = [], outputs = {} }) {
    const fullOpts = outputs.full || {};
    const width = fullOpts.width || frame?.width || 0;
    const height = fullOpts.height || frame?.height || 0;
    const base = this._createSurface(width, height);

    if (background) {
      const bgDrawable = await this._toDrawable(background);
      if (bgDrawable) {
        const bw = bgDrawable.width ?? width;
        const bh = bgDrawable.height ?? height;
        base.drawImage(bgDrawable, 0, 0, bw, bh, 0, 0, width, height);
      } else if (background.color) {
        base.fillRect(0, 0, width, height, background.color);
      }
    }

    if (frame) {
      const frameDrawable = await this._toDrawable(frame);
      if (frameDrawable) {
        const fw = frameDrawable.width ?? width;
        const fh = frameDrawable.height ?? height;
        const sx = crop.srcX ?? 0;
        const sy = crop.srcY ?? 0;
        const sw = crop.srcWidth ?? fw;
        const sh = crop.srcHeight ?? fh;
        base.drawImage(frameDrawable, sx, sy, sw, sh, 0, 0, width, height);
      }
    }

    for (const o of overlays) {
      const candidate = o?.image ?? o?.mask ?? o;
      const img = await this._toDrawable(candidate);
      if (!img) continue;
      const x = o.x ?? 0;
      const y = o.y ?? 0;
      const w = o.width ?? img.width ?? 0;
      const h = o.height ?? img.height ?? 0;
      base.drawImage(img, x, y, w, h);
    }

    const fullBlob = await base.toBlob();
    let thumbBlob = fullBlob;
    if (outputs.thumb) {
      const tW = outputs.thumb.width || width;
      const tH = outputs.thumb.height || height;
      const thumb = this._createSurface(tW, tH);
      thumb.drawImage(base.drawable, 0, 0, width, height, 0, 0, tW, tH);
      thumbBlob = await thumb.toBlob();
    }
    const meta = { crop, overlays };
    return { blobs: { full: fullBlob, thumb: thumbBlob }, meta };
  }

  async _toDrawable(src) {
    if (!src) return null;
    // Already drawable element
    if (
      (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap) ||
      (typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && src instanceof HTMLCanvasElement) ||
      (typeof OffscreenCanvas !== 'undefined' && src instanceof OffscreenCanvas) ||
      (typeof SVGImageElement !== 'undefined' && src instanceof SVGImageElement) ||
      (typeof HTMLVideoElement !== 'undefined' && src instanceof HTMLVideoElement)
    ) {
      return src;
    }

    // URL string or object with src field
    if (typeof src === 'string' || src?.src) {
      const url = typeof src === 'string' ? src : src.src;
      return await this._loadImage(url);
    }

    // Blob source
    if (typeof Blob !== 'undefined' && src instanceof Blob) {
      if (typeof createImageBitmap === 'function') {
        try {
          return await createImageBitmap(src);
        } catch {
          /* fall back to Image element */
        }
      }
      const url = URL.createObjectURL(src);
      try {
        return await this._loadImage(url);
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    return null;
  }

  _loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  _createSurface(width, height) {
    const canvas = this.canvasFactory.create(width, height);
    if (typeof canvas.width === 'number') {
      canvas.width = width;
    }
    if (typeof canvas.height === 'number') {
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('ImageComposerService requires a 2D rendering context from the canvas factory.');
    }
    return {
      canvas,
      ctx,
      drawable: canvas,
      drawImage: (...args) => ctx.drawImage(...args),
      fillRect: (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      },
      async toBlob(type = 'image/png', quality = 1) {
        if (typeof canvas.convertToBlob === 'function') {
          return canvas.convertToBlob({ type, quality });
        }
        if (typeof canvas.toBlob === 'function') {
          return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to generate blob from canvas.'));
              } else {
                resolve(blob);
              }
            }, type, quality);
          });
        }
        throw new Error('Canvas implementation does not support blob conversion.');
      }
    };
  }
}
