---
domains: []
emits: []
implements: []
imports:
  - src/ports/IDatabasePublisher.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/database/DBPublisher.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# DBPublisher

Small facade over `DatabaseAdapter` that publishes domain events. It registers users and inserts posts by delegating SQL to the underlying database service while logging each action[^1][^2].

[^1]: [`DBPublisher.js`](../../../src/adapters/database/DBPublisher.js#L11-L27)
[^2]: [`DatabaseAdapter.js`](../../../src/adapters/database/DatabaseAdapter.js#L90-L111)

