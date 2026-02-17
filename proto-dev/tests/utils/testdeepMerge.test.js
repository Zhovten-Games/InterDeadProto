import assert from 'assert';
import deepMerge from '../../src/utils/deepMerge.js';

describe('deepMerge.js', () => {
  it('merges nested objects and overwrites arrays/primitives', () => {
    const a = { a: { b: 1 }, list: [1, 2], prim: 1 };
    const b = { a: { c: 2 }, list: [3], prim: 2 };
    const result = deepMerge(a, b);

    assert.deepStrictEqual(result.a, { b: 1, c: 2 });
    assert.deepStrictEqual(result.list, [3]);
    assert.strictEqual(result.prim, 2);
  });
});
