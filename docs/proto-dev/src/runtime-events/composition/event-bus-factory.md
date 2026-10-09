---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/adapters/event-bus-adapter.js
  - src/runtime-events/subscriptions/observer.js
listens: []
owns: []
schemaVersion: 1
source: src/runtime-events/composition/event-bus-factory.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: EventBusFactory
contour_primary: SAL-SWITCH
contour_secondary: none
role_group: salience_threat
narrative_role: salience routing switch
---

# EventBusFactory

Creates scoped event bus instances for the container. Each call to `create()` returns a fresh `EventBusAdapter` wired to a dedicated `Observer`, while `getSingleton()` memoizes a shared bus for infrastructure services that should collaborate through a single channel.[^1][^2]

Bootstrapping registers the factory itself and exposes the singleton bus under `IEventBus`, ensuring features can resolve either the shared instance or request new buses when isolation is required.[^3]

[^1]: [`EventBusFactory.js`](../../../../../proto-dev/src/runtime-events/composition/event-bus-factory.js)

[^2]: [`EventBusAdapter.js`](../../../../../proto-dev/src/runtime-events/adapters/event-bus-adapter.js); [`Observer.js`](../../../../../proto-dev/src/runtime-events/subscriptions/observer.js)

[^3]: Factory registration and shared bus wiring [src/app-shell/bootstrap/index.js#L70-L110](../../../../../proto-dev/src/app-shell/bootstrap/index.js)
