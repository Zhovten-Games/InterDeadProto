---
domains: []
emits: []
implements: []
imports:
  - src/config/cacheBuildId.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/ServiceWorkerRegistrar.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# ServiceWorkerRegistrar

Registers the service worker with a cache build ID query parameter, ensuring AI runtime and model caches are tied to the current build. It skips registration when the app is embedded in launcher mode or when the browser lacks service worker support, logging failures via the injected logger.[^1]

[^1]: Registration flow and launcher-mode guard [src/infrastructure/bootstrap/ServiceWorkerRegistrar.js#L1-L26](../../../src/infrastructure/bootstrap/ServiceWorkerRegistrar.js#L1-L26)
