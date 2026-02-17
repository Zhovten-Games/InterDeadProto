import assert from 'assert';

describe('browser spirit config loading', () => {
  it('exposes default spirits without bundler support', async () => {
    // Simulate a plain browser environment where import.meta.glob is undefined
    global.window = {};
    // Bypass module cache between tests
    const modUrl = new URL('../../src/config/index.js', import.meta.url);
    modUrl.search = `?t=${Date.now()}`;
    const mod = await import(modUrl.href);
    assert.ok(mod.spiritConfigs.guide);
    assert.ok(mod.spiritConfigs.guest1);
    delete global.window;
  });
});

