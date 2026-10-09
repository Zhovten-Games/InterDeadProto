import { assert, deferred, flush, runDriver } from '../../driver-tools.mjs';
import Container from '../../../proto-dev/src/app-shell/composition/container.js';
import BootManager from '../../../proto-dev/src/app-shell/bootstrap/boot-manager.js';

await runDriver(['boot.coalescing', 'boot.reverse-rollback', 'boot.dispose-pending'], async () => {
  const container = new Container();
  const events = [],
    resources = [],
    opened = deferred();
  let count = 0;
  container.register('one', () => ({
    boot: async () => {
      count++;
      await opened.promise;
      resources.push('one');
    },
    dispose: () => resources.push('-one'),
  }));
  container.register(
    'two',
    () => ({ boot: () => resources.push('two'), dispose: () => resources.push('-two') }),
    { deps: ['one'] },
  );
  const manager = new BootManager(container, { emit: (event) => events.push(event) });
  const phase = manager.bootPhase(['one']);
  const full = manager.bootAll();
  await flush();
  assert.equal(count, 1);
  opened.resolve();
  await Promise.all([phase, full, manager.bootAll()]);
  assert.deepEqual(resources, ['one', 'two']);
  assert.equal(events.filter((event) => event.type === 'BOOT_COMPLETE').length, 1);
  await manager.disposeAll();
  assert.deepEqual(resources.slice(-2), ['-two', '-one']);
  const failed = new Container();
  const cleaned = [];
  failed.register('a', () => ({ boot() {}, dispose: () => cleaned.push('a') }));
  failed.register(
    'b',
    () => ({
      boot() {
        throw new Error('expected boot failure');
      },
      dispose: () => cleaned.push('b'),
    }),
    { deps: ['a'] },
  );
  await assert.rejects(new BootManager(failed).bootAll(), /expected boot failure/);
  assert.deepEqual(cleaned, ['b', 'a']);
  const blocked = new Container();
  const pending = deferred();
  let disposed = 0;
  blocked.register('pending', () => ({
    boot: () => pending.promise,
    dispose: () => {
      disposed++;
    },
  }));
  const pendingManager = new BootManager(blocked);
  const boot = pendingManager.bootAll();
  const rejected = assert.rejects(boot, /cancelled/);
  await flush();
  await pendingManager.disposeAll();
  await rejected;
  pending.resolve();
  await flush();
  assert.equal(disposed, 1);
});
