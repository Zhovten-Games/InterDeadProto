import { assert, deferred, runDriver } from '../../driver-tools.mjs';
import ContactTransitionController from '../../../proto-dev/src/contact-sessions/application/contact-transition-controller.js';

await runDriver(['switch.A-B-A', 'switch.stale-failure', 'switch.reset-pending'], async () => {
  const controller = new ContactTransitionController();
  const committed = [];
  const a1 = deferred(),
    b = deferred(),
    a2 = deferred();
  const request = (name, pending) =>
    controller.request(
      name,
      () => pending.promise,
      (data) => committed.push(data),
    );
  const first = request('A', a1),
    second = request('B', b),
    third = request('A', a2);
  a2.resolve({ ghost: 'A', config: 3 });
  await third;
  b.reject(new Error('stale B failed'));
  a1.resolve({ ghost: 'A', config: 1 });
  await Promise.all([first, second]);
  assert.deepEqual(committed, [{ ghost: 'A', config: 3 }]);
  assert.equal(controller.committed, 'A');
  const reset = deferred();
  const pending = request('B', reset);
  controller.cancel();
  reset.resolve({ ghost: 'B' });
  await pending;
  assert.equal(committed.length, 1);
});
