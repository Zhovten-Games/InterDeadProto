---
domains: []
emits: []
implements: []
imports:
  - src/ports/IGeolocation.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/geo/GeolocationAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# GeolocationAdapter

Retrieves the user's location via `navigator.geolocation` and records the result in the database service with a source mode flag[^1]. When the API is unavailable or fails, a null coordinate set is stored to maintain a consistent audit trail[^2].

[^1]: [`GeolocationAdapter.js`](../../../src/adapters/geo/GeolocationAdapter.js#L7-L28)
[^2]: [`DatabaseAdapter.js`](../../../src/adapters/database/DatabaseAdapter.js#L160-L165)

