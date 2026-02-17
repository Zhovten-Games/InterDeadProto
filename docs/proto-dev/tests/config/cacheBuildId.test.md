---
domains: []
emits: []
implements: []
imports:
  - src/config/cacheBuildId.js
listens: []
owns: []
schemaVersion: 1
source: tests/config/cacheBuildId.test.js
used_by: []
---

# cacheBuildId.test.js

Ensures `appendCacheBuildParam` adds the cache build query parameter to AI model URLs, confirming the build ID is appended as `v=...`.[^1]

[^1]: Cache build parameter assertion [tests/config/cacheBuildId.test.js#L4-L9](../../../tests/config/cacheBuildId.test.js#L4-L9)
