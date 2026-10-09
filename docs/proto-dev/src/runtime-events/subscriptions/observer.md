---
domains: []
emits: []
implements: []
imports:
  - src/runtime-diagnostics/null-logger.js
listens: []
owns:
  - logger
  - pending
  - subscribers
schemaVersion: 1
source: src/runtime-events/subscriptions/observer.js
used_by:
  - src/runtime-events/adapters/event-bus-adapter.js
  - src/runtime-events/composition/event-bus-factory.js
source_exists: true
runtime_role: observer
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Observer

`Observer` implements a basic publish–subscribe pattern, keeping a list of subscriber callbacks and broadcasting events to them. A `NullLogger` default captures handler errors so tests can run without wiring the full logging adapter.[^1]

Any handler exception is caught, logged, and ignored so downstream subscribers continue to receive events. Callers are expected to supply their own logger when they want richer diagnostics; otherwise the null implementation prevents crashes.[^2]

[^1]: Constructor injection and subscription management [src/runtime-events/subscriptions/observer.js#L1-L28](../../../../../proto-dev/src/runtime-events/subscriptions/observer.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Error handling and logging [src/runtime-events/subscriptions/observer.js#L29-L43](../../../../../proto-dev/src/runtime-events/subscriptions/observer.js)
