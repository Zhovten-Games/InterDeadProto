---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/INotification.js
used_by:
  - src/adapters/notification/NotificationAdapter.js
---

# INotification Port

Delivers user-facing alerts or messages through channels such as on-screen banners or system notifications.[^1] Implementations may log dispatched notifications for auditing purposes.[^3]

## Relations
- Covered by an import test to ensure availability.[^2]
- Can collaborate with `ILogging` to record notification events.[^3]
- Abides by standard port naming rules.[^4]

[^1]: [src/ports/INotification.js](../../src/ports/INotification.js#L1)
[^2]: [tests/ports/testINotification.test.js](../../tests/ports/testINotification.test.js#L3-L14)
[^3]: [src/ports/ILogging.js](../../src/ports/ILogging.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
