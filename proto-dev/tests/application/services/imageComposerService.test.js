import assert from 'assert';
import ImageComposerService from '../../../src/application/services/ImageComposerService.js';

class MockCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.ops = [];
  }

  getContext(type) {
    if (type !== '2d') {
      return null;
    }
    return {
      drawImage: (...args) => this.ops.push(['draw', ...args]),
      fillRect: (x, y, w, h) => this.ops.push(['fill', x, y, w, h])
    };
  }

  toBlob(callback) {
    callback(`blob-${this.width}x${this.height}`);
  }
}

class MockCanvasFactory {
  create(width = 0, height = 0) {
    return new MockCanvas(width, height);
  }
}

describe('ImageComposerService', () => {
  it('blends layers and returns blobs with metadata', async () => {
    const svc = new ImageComposerService(new MockCanvasFactory());
    const frame = { width: 10, height: 10 };
    const res = await svc.compose({
      frame,
      crop: { srcX: 0, srcY: 0, srcWidth: 10, srcHeight: 10 },
      background: { color: '#fff', width: 10, height: 10 },
      overlays: [{ image: { width: 2, height: 2 }, x: 1, y: 1, width: 2, height: 2 }],
      outputs: { full: { width: 10, height: 10 }, thumb: { width: 5, height: 5 } }
    });
    assert.strictEqual(res.blobs.full, 'blob-10x10');
    assert.strictEqual(res.blobs.thumb, 'blob-5x5');
    assert.deepStrictEqual(res.meta.crop, { srcX:0, srcY:0, srcWidth:10, srcHeight:10 });
    assert.strictEqual(res.meta.overlays.length, 1);
  });
});
