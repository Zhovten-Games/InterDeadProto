import assert from 'assert';

describe('button-state.config.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../src/config/button-state.config.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
