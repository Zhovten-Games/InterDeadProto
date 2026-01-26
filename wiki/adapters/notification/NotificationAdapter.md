---
domains: []
emits:
  - STATUS_SHOW
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/ports/INotification.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/notification/NotificationAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# NotificationAdapter

Rather than invoking native browser notifications, this adapter emits `STATUS_SHOW` events on the injected event bus so the UI can display messages consistently. A `NullEventBus` default keeps consumers from needing to wire an infrastructure bus in unit tests while still satisfying the port contract[^1][^2][^3].

[^1]: [`NotificationAdapter.js`](../../../src/adapters/notification/NotificationAdapter.js#L1-L21)
[^2]: [`constants.js`](../../../src/core/events/constants.js#L24)
[^3]: [`NullEventBus.js`](../../../src/core/events/NullEventBus.js#L1-L11)

