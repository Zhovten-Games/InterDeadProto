import assert from 'assert';
import { appendCacheBuildParam } from '../../src/config/cacheBuildId.js';

describe('cacheBuildId', () => {
  it('adds cache build param to URLs', () => {
    const input = '/assets/models/coco-ssd/model.json';
    const output = appendCacheBuildParam(input, 'abc123');
    assert.ok(output.includes('v=abc123'));
  });
});
