---
domains: []
emits: []
implements:
  - IEventBus
imports:
  - src/runtime-events/ports/event-bus-port.js
  - src/runtime-events/subscriptions/observer.js
listens: []
owns:
  - observer
schemaVersion: 1
source: src/runtime-events/adapters/event-bus-adapter.js
used_by:
  - src/runtime-events/composition/event-bus-factory.js
source_exists: true
runtime_role: EventBusAdapter
contour_primary: SAL-SWITCH
contour_secondary: none
role_group: salience_threat
narrative_role: salience routing switch
---

# EventBusAdapter

Wraps the reusable `Observer` helper in an instantiable adapter that fulfills the `IEventBus` port. Each consumer receives its own bus instance (typically via `EventBusFactory`) so subscriptions stay scoped to the owning feature while still supporting dependency injection[^1][^2][^3].

[^1]: [`EventBusAdapter.js`](../../../../../proto-dev/src/runtime-events/adapters/event-bus-adapter.js)

[^2]: [`Observer.js`](../../../../../proto-dev/src/runtime-events/subscriptions/observer.js)

[^3]: [`EventBusFactory.js`](../../../../../proto-dev/src/runtime-events/composition/event-bus-factory.js)
