---
domains: []
emits:
  - log
implements:
  - ILogging
imports:
  - src/runtime-diagnostics/ports/logging-port.js
listens: []
owns:
  - _evtHandler
  - _rejectionHandler
  - _windowErrorHandler
  - bus
  - level
schemaVersion: 1
source: src/runtime-diagnostics/adapters/logging-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: LoggingAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# LoggingAdapter

Provides level‑based console logging and can subscribe to the global event bus to react to `log` messages[^1]. It understands the `debug`, `info`, `warn`, and `error` levels, routing them to `console.log`, `console.log`, `console.warn`, and `console.error` respectively. Modules emit diagnostics via the bus:

```js
bus.emit({ type: 'log', level: 'info', message: 'Loading started' });
bus.emit({ type: 'log', level: 'warn', message: 'Unexpected state' });
```

The adapter also captures uncaught errors and re‑emits them on the bus, allowing other modules to respond uniformly[^2][^3].

[^1]: [`LoggingAdapter.js`](../../../../../proto-dev/src/runtime-diagnostics/adapters/logging-adapter.js)

[^2]: [`LoggingAdapter.js`](../../../../../proto-dev/src/runtime-diagnostics/adapters/logging-adapter.js)

[^3]: [`EventBusAdapter.js`](../../../../../proto-dev/src/runtime-events/adapters/event-bus-adapter.js)

[^4]: log task noting additional log levels (`doc/log.md` (историческая ссылка отсутствует в baseline; не используется как evidence))
