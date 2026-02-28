---
domains: []
emits: []
implements: []
imports:
  - src/ports/IEventBus.js
  - src/utils/Observer.js
listens:
  - handler
owns: []
schemaVersion: 1
source: src/adapters/logging/EventBusAdapter.js
used_by:
  - src/infrastructure/factories/EventBusFactory.js
---

# EventBusAdapter

Wraps the reusable `Observer` helper in an instantiable adapter that fulfills the `IEventBus` port. Each consumer receives its own bus instance (typically via `EventBusFactory`) so subscriptions stay scoped to the owning feature while still supporting dependency injection[^1][^2][^3].

[^1]: [`EventBusAdapter.js`](../../../src/adapters/logging/EventBusAdapter.js#L1-L20)
[^2]: [`Observer.js`](../../../src/utils/Observer.js#L1-L33)
[^3]: [`EventBusFactory.js`](../../../src/infrastructure/factories/EventBusFactory.js#L1-L24)

