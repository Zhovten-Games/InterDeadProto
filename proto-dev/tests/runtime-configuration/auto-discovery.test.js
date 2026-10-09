import assert from 'node:assert/strict';
import { spiritConfigs } from '../../src/app-shell/composition/configuration-index.js';
import guide from '../../src/spirit-contacts/configuration/guide.js';
import guest1 from '../../src/spirit-contacts/configuration/guest1.js';
describe('canonical spirit registry', () => {
  it('declares the same frozen registry for Node, dev and deployment', () => {
    assert.deepEqual(Object.keys(spiritConfigs).sort(), ['guest1', 'guide']);
    assert.equal(spiritConfigs.guide, guide);
    assert.equal(spiritConfigs.guest1, guest1);
    assert.ok(Object.isFrozen(spiritConfigs));
    assert.throws(() => {
      spiritConfigs.unregistered = {};
    }, TypeError);
  });
});
