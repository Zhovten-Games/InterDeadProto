import assert from 'assert';
import Dialog from '../../../src/core/dialog/Dialog.js';

describe('Dialog', () => {
  it('yields messages sequentially', () => {
    const dlg = new Dialog([{ text: 'a' }, { text: 'b' }]);
    assert.strictEqual(dlg.next().text, 'a');
    const state = dlg.serializeState();
    assert.strictEqual(state.index, 1);
    assert.strictEqual(dlg.next().text, 'b');
    assert.ok(dlg.isComplete());
  });
});
