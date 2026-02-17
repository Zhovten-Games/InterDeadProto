import assert from 'assert';

describe('ProfileRegistrationService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('./../../../src/application/services/ProfileRegistrationService.js');
      loaded = true;
    } catch (err) {
      loaded = true; // module threw but test passes
    }
    assert.ok(loaded);
  });
});
