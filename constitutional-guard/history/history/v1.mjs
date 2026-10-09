import { assert, openDatabase, runDriver } from '../../driver-tools.mjs';
import DialogRepository from '../../../proto-dev/src/messenger/persistence/dialog-repository.js';
import DialogHistory from '../../../proto-dev/src/messenger/history/dialog-history-service.js';

await runDriver(
  [
    'history.sequence',
    'history.immutable-metadata',
    'history.legitimate-repetition',
    'history.rollback',
  ],
  async () => {
    const database = await openDatabase();
    try {
      const repository = new DialogRepository(database);
      repository.boot();
      const history = new DialogHistory(repository);
      history.appendUnique('A', [
        { fingerprint: 'a', author: 'ghost', text: 'same', timestamp: 20 },
        { fingerprint: 'b', author: 'ghost', text: 'same', timestamp: 10 },
      ]);
      history.save('A', [
        { fingerprint: 'a', author: 'ghost', text: 'changed', timestamp: 0, sequence: 100 },
      ]);
      history.appendUnique('B', [
        { fingerprint: 'a', author: 'ghost', text: 'another timeline', timestamp: 5 },
      ]);
      assert.deepEqual(
        history
          .load('A')
          .map((message) => [message.fingerprint, message.sequence, message.timestamp]),
        [
          ['a', 1, 20],
          ['b', 2, 10],
        ],
      );
      assert.equal(history.load('A')[0].text, 'same');
      assert.equal(history.load('B')[0].sequence, 1);
      history.setReaction('A', 'a', '🔥', 'system');
      assert.equal(history.load('A')[0].reactionLocked, true);
      const save = database.exportSnapshot();
      const restored = database.fork(save);
      assert.deepEqual(new DialogRepository(restored).loadAll('A'), repository.loadAll('A'));
      restored.db.close();
      const before = history.load('A');
      assert.throws(
        () =>
          repository.appendUnique('A', [
            { fingerprint: 'new', author: 'user' },
            { author: 'user' },
          ]),
        /identity/,
      );
      assert.deepEqual(history.load('A'), before);
      history.appendUnique('A', [{ fingerprint: 'c', author: 'user', text: 'after rollback' }]);
      assert.equal(history.load('A')[2].sequence, 3);
    } finally {
      await database.dispose();
    }
  },
);
