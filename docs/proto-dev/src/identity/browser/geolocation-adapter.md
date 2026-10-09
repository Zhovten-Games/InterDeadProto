---
domains: []
emits: []
implements:
  - IGeolocation
imports:
  - src/identity/ports/geolocation-port.js
listens: []
owns:
  - db
  - logger
schemaVersion: 1
source: src/identity/browser/geolocation-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: GeoService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# GeolocationAdapter

Retrieves the user's location via `navigator.geolocation` and records the result in the database service with a source mode flag[^1]. When the API is unavailable or fails, a null coordinate set is stored to maintain a consistent audit trail[^2].

[^1]: [`GeolocationAdapter.js`](../../../../../proto-dev/src/identity/browser/geolocation-adapter.js)

[^2]: [`DatabaseAdapter.js`](../../../../../proto-dev/src/storage/browser/database-adapter.js)
