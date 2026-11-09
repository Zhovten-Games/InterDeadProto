import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveProjectLinks } from '../../src/asset-delivery/paths/project-links.js';

test('all localized links resolve one configurable site without changing locale or fragment', () => {
  assert.equal(
    resolveProjectLinks('{{INTERDEAD_SITE_URL}}/uk/pages/terms-of-use/#noir'),
    'https://interdead.zhovten.games/uk/pages/terms-of-use/#noir',
  );
  assert.equal(resolveProjectLinks('ordinary text'), 'ordinary text');
  assert.equal(resolveProjectLinks(42), 42);
});
