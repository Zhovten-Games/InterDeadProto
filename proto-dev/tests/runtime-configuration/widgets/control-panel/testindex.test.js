import assert from 'assert';

describe('index.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../../src/app-shell/controls/presentation/control-panel-widget.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
