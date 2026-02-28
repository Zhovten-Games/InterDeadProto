---
domains: []
emits: []
implements: []
imports:
  - src/ports/IPersistence.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/persistence/LocalStorageAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# LocalStorageAdapter

Wraps the Web Storage API to safely persist JSON data, guarding against unavailable storage environments and serialization errors[^1]. It is commonly used by other services like `DatabaseAdapter` to store serialized state[^2].

[^1]: [`LocalStorageAdapter.js`](../../../src/adapters/persistence/LocalStorageAdapter.js#L1-L33)
[^2]: [`DatabaseAdapter.js`](../../../src/adapters/database/DatabaseAdapter.js#L84-L88)

