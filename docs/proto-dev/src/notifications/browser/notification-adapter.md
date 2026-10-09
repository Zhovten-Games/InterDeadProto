---
domains: []
emits:
  - STATUS_SHOW
implements:
  - INotification
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/notifications/ports/notification-port.js
listens: []
owns:
  - bus
schemaVersion: 1
source: src/notifications/browser/notification-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: NotificationAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# NotificationAdapter

Rather than invoking native browser notifications, this adapter emits `STATUS_SHOW` events on the injected event bus so the UI can display messages consistently. A `NullEventBus` default keeps consumers from needing to wire an infrastructure bus in unit tests while still satisfying the port contract[^1][^2][^3].

[^1]: [`NotificationAdapter.js`](../../../../../proto-dev/src/notifications/browser/notification-adapter.js)

[^2]: [`constants.js`](../../../../../proto-dev/src/runtime-events/domain/constants.js)

[^3]: [`NullEventBus.js`](../../../../../proto-dev/src/runtime-events/domain/null-event-bus.js)
