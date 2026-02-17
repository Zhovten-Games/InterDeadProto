import assert from 'assert';
import { ALL_EVENTS } from '../../../src/core/events/constants.js';

describe('Event constants', () => {
  it('contains unique values', () => {
    const unique = new Set(ALL_EVENTS);
    assert.strictEqual(unique.size, ALL_EVENTS.length);
  });

  it('is immutable', () => {
    assert.throws(() => {
      ALL_EVENTS.push('X');
    });
  });
});
