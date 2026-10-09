---
domains: []
emits: []
implements:
  - IConfigLoader
imports:
  - src/runtime-configuration/ports/config-loader-port.js
listens: []
owns:
  - fetch
  - logger
schemaVersion: 1
source: src/runtime-configuration/browser/fetch-config-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: FetchConfigAdapter
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: configuration ingress adapter
---

# FetchConfigAdapter

Retrieves JSON configuration via the Fetch API with optional logging of failures and the flexibility to swap in a custom fetch implementation for testing.[^1][^2] The adapter extends the `IConfigLoader` port so application services can demand the contract while infrastructure decides which transport to use.[^3] It is registered by `InfrastructureModule`, which injects the shared logging adapter to capture HTTP diagnostics.[^4]

[^1]: [`FetchConfigAdapter.js`](../../../../../proto-dev/src/runtime-configuration/browser/fetch-config-adapter.js)

[^2]: [`FetchConfigAdapter.js`](../../../../../proto-dev/src/runtime-configuration/browser/fetch-config-adapter.js)

[^3]: [`IConfigLoader.js`](../../../../../proto-dev/src/runtime-configuration/ports/config-loader-port.js)

[^4]: [`InfrastructureModule.js`](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)
