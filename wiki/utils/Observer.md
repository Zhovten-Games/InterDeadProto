---
domains: []
emits: []
implements: []
imports:
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/utils/Observer.js
used_by:
  - src/adapters/logging/EventBusAdapter.js
  - src/infrastructure/factories/EventBusFactory.js
---

# Observer

`Observer` implements a basic publish–subscribe pattern, keeping a list of subscriber callbacks and broadcasting events to them. A `NullLogger` default captures handler errors so tests can run without wiring the full logging adapter.[^1]

Any handler exception is caught, logged, and ignored so downstream subscribers continue to receive events. Callers are expected to supply their own logger when they want richer diagnostics; otherwise the null implementation prevents crashes.[^2]

[^1]: Constructor injection and subscription management [src/utils/Observer.js#L1-L28](../../src/utils/Observer.js#L1-L28); [wiki/core/logging/NullLogger.md](../core/logging/NullLogger.md)
[^2]: Error handling and logging [src/utils/Observer.js#L29-L43](../../src/utils/Observer.js#L29-L43)
