---
domains: []
emits: []
implements: []
imports:
  - src/asset-delivery/cache/cache-build-id.js
listens: []
owns:
  - embeddingResolver
  - logger
  - windowRef
schemaVersion: 1
source: src/asset-delivery/service-worker/service-worker-registrar.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: ServiceWorkerRegistrar
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ServiceWorkerRegistrar

Registers the service worker with a cache build ID query parameter, ensuring AI runtime and model caches are tied to the current build. It skips registration when the app is embedded in launcher mode or when the browser lacks service worker support, logging failures via the injected logger.[^1]

[^1]: Registration flow and launcher-mode guard [src/asset-delivery/service-worker/service-worker-registrar.js#L1-L26](../../../../../proto-dev/src/asset-delivery/service-worker/service-worker-registrar.js)
