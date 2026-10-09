import assert from 'assert';

describe('ProfileRegistrationService.js', () => {
  it('module can be imported', async () => {
    let loaded = false;
    try {
      await import('../../../src/identity/application/profile-registration-service.js');
      loaded = true;
    } catch (err) {
      throw err; // Import failure must fail this family.
    }
    assert.ok(loaded);
  });
});
