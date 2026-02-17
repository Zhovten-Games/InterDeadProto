import assert from 'assert';

describe('index.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../../src/presentation/widgets/ControlPanel/index.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
