---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/constants.js
  - src/runtime-events/domain/null-event-bus.js
listens: []
owns:
  - _handler
  - bus
  - dialogManager
  - ghostService
  - historyService
schemaVersion: 1
source: src/messenger/application/dialog-history-observer-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogHistoryObserverService
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# DialogHistoryObserverService

Listens for `EVENT_MESSAGE_READY` events and asynchronously persists messages for the current ghost. The observer queues each message to `DialogHistoryService` to avoid blocking other event handlers and relies on an injected event bus (`NullEventBus` by default) for wiring[^1][^2]. Subscriptions are removed on disposal to free resources[^3].

[^1]: [src/messenger/application/dialog-history-observer-service.js](../../../../../proto-dev/src/messenger/application/dialog-history-observer-service.js)

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: [src/messenger/application/dialog-history-observer-service.js](../../../../../proto-dev/src/messenger/application/dialog-history-observer-service.js)
