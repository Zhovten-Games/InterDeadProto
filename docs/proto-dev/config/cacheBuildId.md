---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/cacheBuildId.js
used_by:
  - src/adapters/ai/DetectionAdapter.js
  - src/infrastructure/bootstrap/ServiceWorkerRegistrar.js
  - src/config/assetsBaseUrl.js
---

# Cache Build ID

Provides a stable build identifier for cache busting. `resolveCacheBuildId` checks `window.__CACHE_BUILD_ID__`, an explicit script data attribute, and environment variables before falling back to the `dev` default.[^1]

`appendCacheBuildParam` ensures asset URLs include the build ID as the `v` query param. This keeps runtime scripts, AI models, and service worker registrations aligned with the current build across environments.[^2]

[^1]: Build ID resolution order and defaults [src/config/cacheBuildId.js#L1-L40](../../src/config/cacheBuildId.js#L1-L40)
[^2]: Query parameter helper [src/config/cacheBuildId.js#L42-L53](../../src/config/cacheBuildId.js#L42-L53)
