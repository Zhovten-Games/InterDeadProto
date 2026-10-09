---
domains: []
emits: []
implements:
  - IDatabasePublisher
imports:
  - src/storage/ports/database-publisher-port.js
listens: []
owns:
  - db
  - logger
schemaVersion: 1
source: src/storage/publication/db-publisher.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: DBPublisher
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DBPublisher

Small facade over `DatabaseAdapter` that publishes domain events. It registers users and inserts posts by delegating SQL to the underlying database service while logging each action[^1][^2].

[^1]: [`DBPublisher.js`](../../../../../proto-dev/src/storage/publication/db-publisher.js)

[^2]: [`DatabaseAdapter.js`](../../../../../proto-dev/src/storage/browser/database-adapter.js)
