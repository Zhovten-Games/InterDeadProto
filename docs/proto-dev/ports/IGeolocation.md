---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IGeolocation.js
used_by:
  - src/adapters/geo/GeolocationAdapter.js
---

# IGeolocation Port

Provides access to device location services for features such as geo-tagging and contextual alerts.[^1] Adapter implementations translate platform APIs into a uniform interface.[^3]

## Relations
- Import test verifies the module's presence.[^2]
- Often coordinates with `INotification` to surface location-based messages.[^3]
- Uses the standard port naming scheme.[^4]

[^1]: [src/ports/IGeolocation.js](../../src/ports/IGeolocation.js#L1)
[^2]: [tests/ports/testIGeolocation.test.js](../../tests/ports/testIGeolocation.test.js#L3-L14)
[^3]: [src/ports/INotification.js](../../src/ports/INotification.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
