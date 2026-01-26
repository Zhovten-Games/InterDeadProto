---
domains: []
emits: []
implements: []
imports:
  - src/ports/IConfigLoader.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/config/FetchConfigAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# FetchConfigAdapter

Retrieves JSON configuration via the Fetch API with optional logging of failures and the flexibility to swap in a custom fetch implementation for testing.[^1][^2] The adapter extends the `IConfigLoader` port so application services can demand the contract while infrastructure decides which transport to use.[^3] It is registered by `InfrastructureModule`, which injects the shared logging adapter to capture HTTP diagnostics.[^4]

[^1]: [`FetchConfigAdapter.js`](../../../src/adapters/config/FetchConfigAdapter.js#L6-L15)
[^2]: [`FetchConfigAdapter.js`](../../../src/adapters/config/FetchConfigAdapter.js#L17-L35)
[^3]: [`IConfigLoader.js`](../../../src/ports/IConfigLoader.js#L1-L13)
[^4]: [`InfrastructureModule.js`](../../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L57-L61)
