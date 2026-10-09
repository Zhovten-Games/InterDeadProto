import assert from 'node:assert/strict';
import { bootstrapContext } from '../../fixtures/bootstrap-context.js';
describe('startup messenger screen', () => {
  it('restores messenger and persistence keys from existing database', async () => {
    const context = bootstrapContext({ saved: {}, user: { id: 1, avatar: 'x' } });
    await Promise.all([context.bootstrapper.boot(), context.bootstrapper.boot()]);
    assert.equal(context.events.filter((event) => event.type === 'SCREEN_CHANGE').length, 1);
    assert.equal(
      context.events.find((event) => event.type === 'SCREEN_CHANGE').screen,
      'messenger',
    );
    assert.equal(context.records.get('captured'), true);
    assert.ok(context.records.get('userId'));
    assert.equal(context.calls.complete, 1);
    assert.equal(context.calls.cleared, 0);
    await context.bootstrapper.dispose();
    assert.equal(context.calls.disposal, 1);
  });
});
