import { assert, openDatabase, runDriver } from '../../driver-tools.mjs';
import DialogRepository from '../../../proto-dev/src/messenger/persistence/dialog-repository.js';
import DialogHistory from '../../../proto-dev/src/messenger/history/dialog-history-service.js';
import DialogTimeline from '../../../proto-dev/src/messenger/history/dialog-timeline.js';

await runDriver(
  [
    'restore.late-mount',
    'restore.no-live-effects',
    'restore.concurrent-append',
    'restore.stale-snapshot',
  ],
  async () => {
    const database = await openDatabase();
    try {
      const repository = new DialogRepository(database);
      repository.boot();
      const history = new DialogHistory(repository);
      history.save('A', [{ fingerprint: 'old', author: 'ghost', text: 'retained', timestamp: 1 }]);
      const events = [];
      const timeline = new DialogTimeline(history, { emit: (event) => events.push(event) });
      const original = { ghost: 'A', revision: 1, messages: history.load('A') };
      timeline.replaceMessages(original);
      const live = timeline.accept({
        fingerprint: 'new',
        author: 'user',
        text: 'accepted during mount',
      });
      assert.equal(live.sequence, 2);
      timeline.replaceMessages(original);
      let mounted;
      const unsubscribe = timeline.subscribe((snapshot) => {
        mounted = snapshot;
      });
      assert.deepEqual(
        mounted.messages.map((message) => message.fingerprint),
        ['old', 'new'],
      );
      assert.equal(events.filter((event) => event.type === 'EVENT_MESSAGE_READY').length, 0);
      assert.equal(history.load('A').length, 2);
      timeline.replaceMessages({ ghost: 'B', revision: 3, messages: [] });
      assert.equal(timeline.replaceMessages(original), false);
      assert.equal(timeline.getSnapshot().ghost, 'B');
      unsubscribe();
    } finally {
      await database.dispose();
    }
  },
);
