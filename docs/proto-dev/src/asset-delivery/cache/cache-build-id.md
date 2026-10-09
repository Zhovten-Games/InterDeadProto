---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/asset-delivery/cache/cache-build-id.js
used_by:
  - src/camera/detection/detection-adapter.js
  - src/asset-delivery/service-worker/service-worker-registrar.js
source_exists: true
runtime_role: resolveCacheBuildId
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Cache Build ID

Provides a stable build identifier for cache busting. `resolveCacheBuildId` checks `window.__CACHE_BUILD_ID__`, an explicit script data attribute, and environment variables before falling back to the `dev` default.[^1]

`appendCacheBuildParam` ensures asset URLs include the build ID as the `v` query param. This keeps runtime scripts, AI models, and service worker registrations aligned with the current build across environments.[^2]

[^1]: Build ID resolution order and defaults [src/asset-delivery/cache/cache-build-id.js#L1-L40](../../../../../proto-dev/src/asset-delivery/cache/cache-build-id.js)

[^2]: Query parameter helper [src/asset-delivery/cache/cache-build-id.js#L42-L53](../../../../../proto-dev/src/asset-delivery/cache/cache-build-id.js)
