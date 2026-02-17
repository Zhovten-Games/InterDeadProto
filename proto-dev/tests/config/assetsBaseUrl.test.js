import assert from 'assert';

import { AssetUrlMapper, AssetsBaseUrlResolver } from '../../src/config/assetsBaseUrl.js';

describe('assets base url resolver', () => {
  it('prefers explicit embed marker attributes', () => {
    const documentRef = {
      currentScript: {
        getAttribute: (name) =>
          name === 'data-interdead-assets-base' ? 'https://cdn.example/assets' : null,
        dataset: {},
      },
      querySelector: () => null,
    };
    const resolver = new AssetsBaseUrlResolver({
      documentRef,
      moduleUrl: 'https://example.com/assets/app.js',
    });
    assert.strictEqual(resolver.getBaseUrl(), 'https://cdn.example/assets/');
  });

  it('derives base url from module asset path', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/assets/chunks/app.js',
    });
    assert.strictEqual(resolver.getBaseUrl(), 'https://example.com/InterDeadProto/assets/');
  });

  it('falls back to relative assets when no marker is detected', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/main.js',
    });
    assert.strictEqual(resolver.getBaseUrl(), 'assets/');
  });

  it('derives base url from route path without trailing slash', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/main.js',
      locationUrl: 'https://example.com/proto-dev',
    });
    assert.strictEqual(resolver.getBaseUrl(), 'https://example.com/proto-dev/assets/');
  });

  it('derives base url from location when module path has no hint', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/main.js',
      locationUrl: 'https://example.com/proto-dev/index.html',
    });
    assert.strictEqual(resolver.getBaseUrl(), 'https://example.com/proto-dev/assets/');
  });

  it('resolves asset paths against the base url', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/assets/app.js',
    });
    assert.strictEqual(
      resolver.resolve('images/pic.png'),
      'https://example.com/InterDeadProto/assets/images/pic.png',
    );
  });
});

describe('asset url mapper', () => {
  it('maps nested asset strings onto the base url', () => {
    const resolver = new AssetsBaseUrlResolver({
      documentRef: null,
      moduleUrl: 'https://example.com/InterDeadProto/assets/app.js',
    });
    const mapper = new AssetUrlMapper(resolver);
    const mapped = mapper.mapConfig({
      avatar: 'assets/images/pencil.png',
      sounds: {
        message: {
          ghost: '/assets/audio/ghost_effect.mp3',
        },
      },
    });
    assert.deepStrictEqual(mapped, {
      avatar: 'https://example.com/InterDeadProto/assets/images/pencil.png',
      sounds: {
        message: {
          ghost: 'https://example.com/InterDeadProto/assets/audio/ghost_effect.mp3',
        },
      },
    });
  });
});
