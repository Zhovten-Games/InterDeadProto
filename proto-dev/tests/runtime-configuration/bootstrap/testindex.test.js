import assert from 'node:assert/strict';
import ApplicationBootstrap from '../../../src/app-shell/bootstrap/application-bootstrap.js';
describe('application entry lifecycle', () => {
  it('imports without side effects and coalesces public startup', async () => {
    let boots = 0,
      bridges = 0;
    const handlers = new Set();
    const bootstrapper = {
      boot: async () => {
        boots++;
      },
      dispose: async () => {},
    };
    const application = new ApplicationBootstrap({
      compose: () => ({
        container: {
          resolve: (name) =>
            name === 'EmbeddingModeResolver'
              ? { resolve: () => ({ mode: 'full' }) }
              : name === 'IPersistence'
                ? {}
                : bootstrapper,
        },
      }),
      windowRef: {
        addEventListener: (_, handler) => handlers.add(handler),
        removeEventListener: (_, handler) => handlers.delete(handler),
      },
      documentRef: {},
      bridgeFactory: () => ({
        boot: () => {
          bridges++;
        },
        dispose() {},
      }),
    });
    await Promise.all([application.start(), application.start()]);
    await application.start();
    assert.equal(boots, 1);
    assert.equal(bridges, 1);
    assert.equal(handlers.size, 1);
    await application.dispose();
    assert.equal(handlers.size, 0);
    await application.start();
    assert.equal(boots, 2);
    await application.dispose();
  });
});
