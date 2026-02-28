---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IConfigLoader.js
used_by:
  - src/adapters/config/FetchConfigAdapter.js
---

# IConfigLoader Port

Defines the contract for loading configuration resources so application services can request JSON payloads without knowing the transport.[^1]

## Relations
- Implemented by `FetchConfigAdapter`, which logs failures and supports pluggable fetch implementations.[^2]
- Consumed by `DualityConfigService` when retrieving spirit manifests.[^3]
- Registered in `InfrastructureModule` alongside the shared logging adapter, making the port available to higher-layer modules.[^4]

[^1]: [`IConfigLoader.js`](../../src/ports/IConfigLoader.js#L1-L13)
[^2]: [`FetchConfigAdapter.js`](../../src/adapters/config/FetchConfigAdapter.js#L6-L35)
[^3]: [`DualityConfigService.js`](../../src/application/services/DualityConfigService.js#L9-L27)
[^4]: [`InfrastructureModule.js`](../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L57-L61)
