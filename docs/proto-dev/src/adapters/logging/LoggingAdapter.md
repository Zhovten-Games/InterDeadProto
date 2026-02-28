---
domains: []
emits:
  - log
implements: []
imports:
  - src/ports/ILogging.js
listens:
  - log
owns: []
schemaVersion: 1
source: src/adapters/logging/LoggingAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# LoggingAdapter

Provides level‑based console logging and can subscribe to the global event bus to react to `log` messages[^1]. It understands the `debug`, `info`, `warn`, and `error` levels, routing them to `console.log`, `console.log`, `console.warn`, and `console.error` respectively. Modules emit diagnostics via the bus:

```js
bus.emit({ type: 'log', level: 'info', message: 'Loading started' });
bus.emit({ type: 'log', level: 'warn', message: 'Unexpected state' });
```

The adapter also captures uncaught errors and re‑emits them on the bus, allowing other modules to respond uniformly[^2][^3].

[^1]: [`LoggingAdapter.js`](../../../src/adapters/logging/LoggingAdapter.js#L1-L33)
[^2]: [`LoggingAdapter.js`](../../../src/adapters/logging/LoggingAdapter.js#L35-L46)
[^3]: [`EventBusAdapter.js`](../../../src/adapters/logging/EventBusAdapter.js#L1-L6)
[^4]: log task noting additional log levels ([`doc/log.md`](../../../doc/log.md#L1266))

