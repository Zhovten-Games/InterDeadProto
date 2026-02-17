import assert from 'assert';
import { resolveYoutubeId } from '../../src/utils/youtube.js';

describe('resolveYoutubeId', () => {
  it('accepts direct video ids', () => {
    assert.strictEqual(resolveYoutubeId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  });

  it('extracts ids from watch urls', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    assert.strictEqual(resolveYoutubeId(url), 'dQw4w9WgXcQ');
  });

  it('extracts ids from short urls', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    assert.strictEqual(resolveYoutubeId(url), 'dQw4w9WgXcQ');
  });

  it('extracts ids from embed urls', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    assert.strictEqual(resolveYoutubeId(url), 'dQw4w9WgXcQ');
  });
});
