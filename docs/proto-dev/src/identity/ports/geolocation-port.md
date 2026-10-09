---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/identity/ports/geolocation-port.js
used_by:
  - src/identity/browser/geolocation-adapter.js
source_exists: true
runtime_role: IGeolocation
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IGeolocation Port

Provides access to device location services for features such as geo-tagging and contextual alerts.[^1] Adapter implementations translate platform APIs into a uniform interface.[^3]

## Relations

- Import test verifies the module's presence.[^2]
- Often coordinates with `INotification` to surface location-based messages.[^3]
- Uses the standard port naming scheme.[^4]

[^1]: [src/identity/ports/geolocation-port.js](../../../../../proto-dev/src/identity/ports/geolocation-port.js)

[^2]: [tests/ports/testIGeolocation.test.js](../../../../../proto-dev/tests/identity/test-i-geolocation.test.js)

[^3]: [src/notifications/ports/notification-port.js](../../../../../proto-dev/src/notifications/ports/notification-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
