---
domains: []
emits: []
implements: []
imports:
  - src/adapters/logging/EventBusAdapter.js
  - src/utils/Observer.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/factories/EventBusFactory.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# EventBusFactory

Creates scoped event bus instances for the container. Each call to `create()` returns a fresh `EventBusAdapter` wired to a dedicated `Observer`, while `getSingleton()` memoizes a shared bus for infrastructure services that should collaborate through a single channel.[^1][^2]

Bootstrapping registers the factory itself and exposes the singleton bus under `IEventBus`, ensuring features can resolve either the shared instance or request new buses when isolation is required.[^3]

[^1]: [`EventBusFactory.js`](../../../src/infrastructure/factories/EventBusFactory.js#L1-L24)
[^2]: [`EventBusAdapter.js`](../../../src/adapters/logging/EventBusAdapter.js#L1-L20); [`Observer.js`](../../../src/utils/Observer.js#L1-L33)
[^3]: Factory registration and shared bus wiring [src/infrastructure/bootstrap/index.js#L70-L110](../../../src/infrastructure/bootstrap/index.js#L70-L110)
