import assert from 'assert';
import GhostRebootCheckpointService from '../../../src/application/services/GhostRebootCheckpointService.js';

describe('GhostRebootCheckpointService', () => {
  it('persists and restores a checkpoint per ghost', () => {
    const memory = {};
    const persistence = {
      load(key) {
        return memory[key];
      },
      save(key, value) {
        memory[key] = value;
      }
    };

    const service = new GhostRebootCheckpointService(persistence);
    service.saveCheckpoint('guide', {
      history: [{ author: 'ghost', text: 'hello' }],
      savedAt: 123
    });

    const restored = service.getCheckpoint('guide');
    assert.ok(restored);
    assert.strictEqual(restored.history.length, 1);
    assert.strictEqual(restored.history[0].text, 'hello');

    service.clearGhost('guide');
    assert.strictEqual(service.getCheckpoint('guide'), null);
  });
});
