import assert from 'assert';
import DialogHistoryBuffer from '../../../src/application/services/DialogHistoryBuffer.js';

function msg(fingerprint, extras = {}) {
  return { author: 'ghost', text: 't', fingerprint, ...extras };
}

describe('DialogHistoryBuffer', () => {
  it('appends unique messages only once', () => {
    const buffer = new DialogHistoryBuffer();
    const a = msg('a');
    buffer.append(a);
    buffer.append({ ...a });
    assert.deepStrictEqual(buffer.merge([]), [a]);
  });

  it('merges persisted history and returns delta', () => {
    const buffer = new DialogHistoryBuffer();
    buffer.append(msg('a'));
    buffer.append(msg('b'));
    const delta = buffer.merge([msg('a')]);
    assert.strictEqual(delta.length, 1);
    assert.strictEqual(delta[0].fingerprint, 'b');
  });

  it('flushes to history service and clears', () => {
    const saved = [];
    const historyService = {
      append: (ghost, list) => saved.push({ ghost, list })
    };
    const buffer = new DialogHistoryBuffer();
    buffer.append(msg('a'));
    buffer.flushTo(historyService, 'g1');
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].ghost, 'g1');
    assert.strictEqual(saved[0].list[0].fingerprint, 'a');
    buffer.clear();
    const delta = buffer.merge([]);
    assert.strictEqual(delta.length, 0);
  });

  it('resets messages and fingerprints', () => {
    const buffer = new DialogHistoryBuffer();
    buffer.append({ author: 'ghost', text: 'hi' });
    buffer.reset();
    buffer.append({ author: 'ghost', text: 'hi' });
    const delta = buffer.merge([]);
    assert.strictEqual(delta.length, 1);
  });
});
