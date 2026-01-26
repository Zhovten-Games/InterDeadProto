---
domains: []
emits: []
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - EVENT_MESSAGE_READY
owns: []
schemaVersion: 1
source: src/application/services/DialogHistoryObserverService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogHistoryObserverService

Listens for `EVENT_MESSAGE_READY` events and asynchronously persists messages for the current ghost. The observer queues each message to `DialogHistoryService` to avoid blocking other event handlers and relies on an injected event bus (`NullEventBus` by default) for wiring[^1][^2]. Subscriptions are removed on disposal to free resources[^3].

[^1]: [src/application/services/DialogHistoryObserverService.js](../../src/application/services/DialogHistoryObserverService.js#L1-L27)
[^2]: [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: [src/application/services/DialogHistoryObserverService.js](../../src/application/services/DialogHistoryObserverService.js#L29-L36)
