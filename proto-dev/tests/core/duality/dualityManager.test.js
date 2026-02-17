import assert from 'assert';
import DualityManager from '../../../src/core/sequence/DualityManager.js';
import { DUALITY_STARTED, DUALITY_COMPLETED } from '../../../src/core/events/constants.js';

describe('DualityManager', () => {
  it('loads config and starts with first event', () => {
    const events = [];
    const bus = { emit: evt => events.push(evt) };
    const store = { save() {}, load() { return {}; } };
    const logs = [];
    const logger = { info: msg => logs.push(msg) };
    const config = {
      id: 'guide',
      stages: [
        { event: { id: 'intro', autoStart: true, messages: [{ author: 'ghost', text: 'hi' }] } }
      ]
    };
    const tm = new DualityManager(bus, store, logger);
    tm.load(config);
    tm.start();
    assert.strictEqual(events[0].type, DUALITY_STARTED);
    const dlg = tm.getCurrentDialog();
    assert.strictEqual(dlg.messages[0].text, 'hi');
    assert.ok(logs.includes('Duality started: guide'));
    tm.completeCurrentEvent();
    assert.ok(logs.includes('Duality completed: guide'));
  });
});
