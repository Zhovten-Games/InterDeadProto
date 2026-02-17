---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/DualityConfigService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DualityConfigService

Loads spirit configuration files for the duality system by delegating JSON retrieval to the `IConfigLoader` port and enforcing that every payload exposes a `stages` array.[^1] The base path is configurable—`ApplicationModule` injects the loader from infrastructure and pins the default repository to `src/config/spirits` when wiring the service.[^2]

[^1]: [`DualityConfigService.js`](../../src/application/services/DualityConfigService.js#L9-L27)
[^2]: [`ApplicationModule.js`](../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L50-L54)
