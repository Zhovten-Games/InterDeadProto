import assert from 'assert';
import ItemOverlayService from '../../../src/application/services/ItemOverlayService.js';

class FakeContext {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.globalCompositeOperation = 'source-over';
    this.polygon = [];
  }
  drawImage(img, a, b, c, d, e, f, g, h) {
    let sx, sy, sw, sh, dx, dy;
    if (arguments.length === 5) {
      sx = 0; sy = 0; sw = img.width; sh = img.height; dx = a; dy = b;
    } else {
      sx = a; sy = b; sw = c; sh = d; dx = e; dy = f;
    }
    const srcCtx = img.getContext('2d');
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const sIdx = ((sy + y) * img.width + (sx + x)) * 4;
        const dIdx = ((dy + y) * this.width + (dx + x)) * 4;
        const sA = srcCtx.data[sIdx + 3] / 255;
        if (this.globalCompositeOperation === 'destination-in') {
          const dAlpha = this.data[dIdx + 3] / 255;
          this.data[dIdx + 3] = dAlpha * sA * 255;
        } else {
          for (let i = 0; i < 3; i++) {
            const s = srcCtx.data[sIdx + i];
            const d = this.data[dIdx + i];
            this.data[dIdx + i] = s * sA + d * (1 - sA);
          }
          const dAlpha = this.data[dIdx + 3] / 255;
          this.data[dIdx + 3] = (sA + dAlpha * (1 - sA)) * 255;
        }
      }
    }
  }
  beginPath() { this.polygon = []; }
  moveTo(x, y) { this.polygon.push({ x, y }); }
  lineTo(x, y) { this.polygon.push({ x, y }); }
  closePath() {}
  fill() {
    if (this.globalCompositeOperation === 'destination-in' && this.polygon.length) {
      const xs = this.polygon.map(p => p.x);
      const ys = this.polygon.map(p => p.y);
      const minX = Math.floor(Math.min(...xs));
      const maxX = Math.ceil(Math.max(...xs));
      const minY = Math.floor(Math.min(...ys));
      const maxY = Math.ceil(Math.max(...ys));
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (y * this.width + x) * 4 + 3;
          if (x >= minX && x < maxX && y >= minY && y < maxY) {
            // keep alpha
          } else {
            this.data[idx] = 0;
          }
        }
      }
    }
  }
  save() {}
  restore() {}
  getImageData() { return { data: this.data }; }
  putImageData(imgData) { this.data.set(imgData.data); }
}

class FakeCanvas {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.ctx = null;
  }
  getContext() {
    if (!this.ctx) this.ctx = new FakeContext(this.width, this.height);
    return this.ctx;
  }
}

class FakeCanvasFactory {
  constructor() {
    this.created = [];
  }
  create() {
    const c = new FakeCanvas();
    this.created.push(c);
    return c;
  }
}

describe('ItemOverlayService', () => {
  it('draws cropped image to target coordinates', async () => {
    const factory = new FakeCanvasFactory();
    const drawArgs = [];
    // capture drawImage calls on created canvases
    factory.create = () => {
      const c = new FakeCanvas();
      c.getContext('2d').drawImage = (...args) => drawArgs.push(args);
      return c;
    };
    const service = new ItemOverlayService(factory);
    service._blobToImage = async () => {
      const img = new FakeCanvas();
      img.width = 100;
      img.height = 100;
      return img;
    };
    const bg = new FakeCanvas();
    bg.width = 200;
    bg.height = 200;
    const coords = { x: 10, y: 20, width: 30, height: 40, srcX: 5, srcY: 6, srcWidth: 50, srcHeight: 60 };
    await service.compose(new Blob(), bg, coords);
    assert.strictEqual(drawArgs.length, 3);
    const cropArgs = drawArgs[1];
    assert.deepStrictEqual(cropArgs.slice(1), [5, 6, 50, 60, 0, 0, 50, 60]);
    const itemArgs = drawArgs[2];
    assert.deepStrictEqual(itemArgs.slice(1), [0, 0, 50, 60, 10, 20, 30, 40]);
  });

  it('applies polygon mask leaving outside area transparent', async () => {
    const factory = new FakeCanvasFactory();
    const service = new ItemOverlayService(factory);
    service._blobToImage = async () => {
      const c = factory.create();
      c.width = 2; c.height = 1;
      const ctx = c.getContext('2d');
      ctx.data.set([255,0,0,255, 255,0,0,255]);
      return c;
    };
    const mask = { polygon: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ] };
    const canvas = await service.compose(new Blob(), null, { srcWidth: 2, srcHeight: 1, width: 2, height: 1 }, mask);
    const data = canvas.getContext('2d').getImageData(0, 0, 2, 1).data;
    assert.deepStrictEqual(Array.from(data.slice(0, 4)), [255, 0, 0, 255]);
    assert.strictEqual(data[7], 0); // alpha of second pixel
  });

  it('renders background under masked region', async () => {
    const factory = new FakeCanvasFactory();
    const service = new ItemOverlayService(factory);
    service._blobToImage = async () => {
      const c = factory.create();
      c.width = 2; c.height = 1;
      const ctx = c.getContext('2d');
      ctx.data.set([255,0,0,255, 255,0,0,255]);
      return c;
    };
    const bg = factory.create();
    bg.width = 2; bg.height = 1;
    const bgCtx = bg.getContext('2d');
    bgCtx.data.set([0,128,0,255, 0,128,0,255]);
    const mask = { polygon: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ] };
    const canvas = await service.compose(new Blob(), bg, { srcWidth: 2, srcHeight: 1, width: 2, height: 1 }, mask);
    const data = canvas.getContext('2d').getImageData(0,0,2,1).data;
    // left pixel red
    assert.deepStrictEqual(Array.from(data.slice(0,4)), [255,0,0,255]);
    // right pixel should show green background
    assert.deepStrictEqual(Array.from(data.slice(4,8)), [0,128,0,255]);
  });

  it('crops source using imageData mask', async () => {
    const factory = new FakeCanvasFactory();
    const service = new ItemOverlayService(factory);
    service._blobToImage = async () => {
      const c = factory.create();
      c.width = 3; c.height = 1;
      const ctx = c.getContext('2d');
      ctx.data.set([
        255,0,0,255,
        255,0,0,255,
        255,0,0,255
      ]);
      return c;
    };
    const mask = {
      imageData: {
        width: 3,
        height: 1,
        data: new Uint8ClampedArray([
          0,0,0,0,
          0,0,0,255,
          0,0,0,0
        ])
      }
    };
    const canvas = await service.compose(
      new Blob(),
      null,
      { srcX: 1, srcY: 0, srcWidth: 2, srcHeight: 1, width: 2, height: 1 },
      mask
    );
    const data = canvas.getContext('2d').getImageData(0, 0, 2, 1).data;
    assert.deepStrictEqual(Array.from(data.slice(0, 4)), [255, 0, 0, 255]);
    assert.strictEqual(data[7], 0);
  });
});
