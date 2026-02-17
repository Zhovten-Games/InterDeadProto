---
domains: []
emits: []
implements: []
imports: []
listens:
  - fetch
  - install
  - activate
owns: []
schemaVersion: 1
source: proto-dev/sw.js
used_by:
  - proto-dev/src/infrastructure/bootstrap/ServiceWorkerRegistrar.js
---

# Service Worker (proto-dev/sw.js)

Caches AI runtime scripts and model assets by build ID, with distinct cache namespaces for runtime and model resources.[^1]

Activation prunes stale caches, and fetch interception serves/stores matching runtime/model requests with cache-build query handling.[^2]

[^1]: Cache keys and asset filters [proto-dev/sw.js#L1-L24](../../proto-dev/sw.js#L1-L24)
[^2]: Install/activate/fetch handlers [proto-dev/sw.js#L26-L68](../../proto-dev/sw.js#L26-L68)
