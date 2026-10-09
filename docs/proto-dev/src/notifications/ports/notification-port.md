---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/notifications/ports/notification-port.js
used_by:
  - src/notifications/browser/notification-adapter.js
source_exists: true
runtime_role: INotification
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# INotification Port

Delivers user-facing alerts or messages through channels such as on-screen banners or system notifications.[^1] Implementations may log dispatched notifications for auditing purposes.[^3]

## Relations

- Covered by an import test to ensure availability.[^2]
- Can collaborate with `ILogging` to record notification events.[^3]
- Abides by standard port naming rules.[^4]

[^1]: [src/notifications/ports/notification-port.js](../../../../../proto-dev/src/notifications/ports/notification-port.js)

[^2]: [tests/ports/testINotification.test.js](../../../../../proto-dev/tests/notifications/test-i-notification.test.js)

[^3]: [src/runtime-diagnostics/ports/logging-port.js](../../../../../proto-dev/src/runtime-diagnostics/ports/logging-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
