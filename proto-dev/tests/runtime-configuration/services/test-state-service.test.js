import assert from 'assert';

describe('StateService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/app-shell/state/application-state-service.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
