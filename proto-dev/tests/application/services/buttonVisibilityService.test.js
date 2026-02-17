import assert from 'assert';
import ButtonVisibilityService from '../../../src/application/services/ButtonVisibilityService.js';
import LocalStorageAdapter from '../../../src/adapters/persistence/LocalStorageAdapter.js';
import NullLogger from '../../../src/core/logging/NullLogger.js';

describe('ButtonVisibilityService persistence', () => {
  it('stores JSON and restores visibility on boot', () => {
    const memory = {};
    const storage = {
      getItem: k => (k in memory ? memory[k] : null),
      setItem: (k, v) => { memory[k] = v; },
      removeItem: k => { delete memory[k]; }
    };
    const bus = { emit: () => {} };
    const logger = new NullLogger();
    const adapter = new LocalStorageAdapter(storage);
    const svc = new ButtonVisibilityService(bus, adapter, logger);
    svc.boot();
    svc.setScreenVisibility('messenger', 'post', false);
    svc.setScreenVisibility('camera', 'capture-btn', true);
    assert.deepStrictEqual(JSON.parse(memory.buttonVisibility), {
      'messenger:toggle-camera': true,
      'camera:toggle-messenger': false,
      'messenger:post': false,
      'camera:capture-btn': true
    });
    const adapterReload = new LocalStorageAdapter(storage);
    const reload = new ButtonVisibilityService(bus, adapterReload, logger);
    reload.boot();
    assert.strictEqual(reload.isVisible('post', 'messenger'), false);
    assert.strictEqual(reload.isVisible('capture-btn', 'camera'), true);
    assert.strictEqual(reload.isVisible('toggle-camera', 'messenger'), true);
  });
});
