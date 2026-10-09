---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-configuration/ports/config-loader-port.js
used_by:
  - src/runtime-configuration/browser/fetch-config-adapter.js
source_exists: true
runtime_role: IConfigLoader
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IConfigLoader Port

Defines the contract for loading configuration resources so application services can request JSON payloads without knowing the transport.[^1]

## Relations

- Implemented by `FetchConfigAdapter`, which logs failures and supports pluggable fetch implementations.[^2]
- Consumed by `DualityConfigService` when retrieving spirit manifests.[^3]
- Registered in `InfrastructureModule` alongside the shared logging adapter, making the port available to higher-layer modules.[^4]

[^1]: [`IConfigLoader.js`](../../../../../proto-dev/src/runtime-configuration/ports/config-loader-port.js)

[^2]: [`FetchConfigAdapter.js`](../../../../../proto-dev/src/runtime-configuration/browser/fetch-config-adapter.js)

[^3]: [`DualityConfigService.js`](../../../../../proto-dev/src/narrative-runtime/configuration/duality-config-service.js)

[^4]: [`InfrastructureModule.js`](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)
