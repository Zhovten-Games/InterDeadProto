---
domains: []
emits: []
implements: []
imports:
  - src/asset-delivery/paths/assets-base-url.js
listens: []
owns:
  - assetUrlMapper
  - basePath
  - configLoader
schemaVersion: 1
source: src/narrative-runtime/configuration/duality-config-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DualityConfigService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DualityConfigService

Loads spirit configuration files for the duality system by delegating JSON retrieval to the `IConfigLoader` port and enforcing that every payload exposes a `stages` array.[^1] The base path is configurable—`ApplicationModule` injects the loader from infrastructure and pins the default repository to `src/config/spirits` when wiring the service.[^2]

[^1]: [`DualityConfigService.js`](../../../../../proto-dev/src/narrative-runtime/configuration/duality-config-service.js)

[^2]: [`ApplicationModule.js`](../../../../../proto-dev/src/app-shell/composition/application-module.js)
