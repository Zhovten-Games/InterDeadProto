import assert from 'assert';
import MessageDeduplicator from '../../src/messenger/presentation/message-deduplicator.js';
import messageFingerprint from '../../src/messenger/identity/message-fingerprint.js';

describe('Dialog image deduplication', () => {
  it('deduplicates image identity and preserves distinct occurrences', () => {
    const dedupe = new MessageDeduplicator();
    const img1 = { ghost: 'g', author: 'ghost', type: 'image', src: 'a.png' };
    img1.fingerprint = messageFingerprint(img1);
    const img2 = { ghost: 'g', author: 'ghost', type: 'image', src: 'b.png' };
    img2.fingerprint = messageFingerprint(img2);
    assert.ok(dedupe.register(img1));
    assert.ok(dedupe.register(img2));
    assert.strictEqual(dedupe.register({ ...img1 }), false);
    // Same image bytes in another declared occurrence remain distinct.
    assert.strictEqual(dedupe.register({ ...img1, fingerprint: 'other' }), true);
  });

  it('uses media id as a stable key when URL arrives later', () => {
    const dedupe = new MessageDeduplicator();
    const base = { ghost: 'g', author: 'ghost', type: 'image', media: { id: '1' } };
    const update = {
      ghost: 'g',
      author: 'ghost',
      type: 'image',
      media: { id: '1', src: 'a.png' },
    };
    const key1 = messageFingerprint(base);
    const key2 = messageFingerprint(update);
    assert.strictEqual(key1, key2);
    assert.ok(dedupe.register(base));
    // The update should map to the same key and be treated as duplicate
    assert.strictEqual(dedupe.register(update), false);
  });
});
