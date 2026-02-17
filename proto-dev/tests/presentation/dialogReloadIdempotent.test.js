import assert from 'assert';
import MessageDeduplicator from '../../src/presentation/widgets/Dialog/MessageDeduplicator.js';
import messageFingerprint from '../../src/utils/messageFingerprint.js';

describe('Dialog reload deduplication', () => {
  it('allows messages once per session and again after clear', () => {
    const dedupe = new MessageDeduplicator();
    const msgs = [
      { ghost: 'g', author: 'ghost', text: 'g1', type: 'text' },
      { ghost: 'g', author: 'ghost', text: 'g2', type: 'text' },
      { ghost: 'g', author: 'user', text: 'u1', type: 'text' }
    ].map(m => ({ ...m, fingerprint: messageFingerprint(m) }));
    msgs.forEach(m => assert.ok(dedupe.register(m)));
    msgs.forEach(m => assert.strictEqual(dedupe.register(m), false));
    dedupe.clear();
    msgs.forEach(m => assert.ok(dedupe.register(m)));
  });
});
