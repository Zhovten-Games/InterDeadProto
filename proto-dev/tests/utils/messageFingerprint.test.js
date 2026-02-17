import assert from 'assert';
import messageFingerprint from '../../src/utils/messageFingerprint.js';

describe('messageFingerprint', () => {
  it('includes image src in fingerprint', () => {
    const a = messageFingerprint({ ghost: 'g', author: 'ghost', type: 'image', src: 'a.png' });
    const b = messageFingerprint({ ghost: 'g', author: 'ghost', type: 'image', src: 'b.png' });
    assert.notStrictEqual(a, b);
  });

  it('remains stable across calls', () => {
    const base = { ghost: 'g', author: 'ghost', text: 'hello', type: 'text' };
    const first = messageFingerprint(base);
    const second = messageFingerprint({ ...base });
    assert.strictEqual(first, second);
  });

  it('uses media.id when available', () => {
    const a = messageFingerprint({ ghost: 'g', author: 'ghost', type: 'image', media: { id: '1' } });
    const b = messageFingerprint({ ghost: 'g', author: 'ghost', type: 'image', media: { id: '2' } });
    assert.notStrictEqual(a, b);
  });

  it('derives a stable fingerprint from youtube urls', () => {
    const base = { ghost: 'g', author: 'ghost', type: 'youtube', text: 'watch' };
    const a = messageFingerprint({ ...base, youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ' });
    const b = messageFingerprint({ ...base, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    assert.strictEqual(a, b);
  });
});
