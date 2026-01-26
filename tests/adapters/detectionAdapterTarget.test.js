import assert from 'assert';
import DetectionAdapter from '../../src/adapters/ai/DetectionAdapter.js';

describe('DetectionAdapter target', () => {
  it('detects provided target', async () => {
    global.createImageBitmap = async () => ({});
    const logger = { info() {}, warn() {}, error() {} };
    const events = [];
    const bus = { emit(evt) { events.push(evt); } };
    const state = {
      presence: {},
      currentScreen: 'camera',
      setPresence(type, val) { this.presence[type] = val; }
    };
    const adapter = new DetectionAdapter(logger, state, bus);
    adapter.model = { detect: async () => [{ class: 'cat', score: 0.9, bbox: [0, 0, 1, 1] }] };
    const res = await adapter.detectTarget(new Blob(), 'cat');
    assert.strictEqual(res.ok, true);
    assert.ok(res.box);
    assert.strictEqual(state.presence.cat, true);
    assert.ok(events.find(e => e.type === 'BUTTON_STATE_UPDATED'));
    delete global.createImageBitmap;
  });
});
