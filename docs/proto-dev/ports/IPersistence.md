---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IPersistence.js
used_by:
  - src/adapters/persistence/LocalStorageAdapter.js
---

# IPersistence Port

Provides a high-level API for saving and retrieving application data regardless of the underlying storage technology.[^1] Implementations delegate actual storage operations to database adapters.[^3]

## Relations
- Import test ensures the interface can be loaded.[^2]
- Relies on `IDatabase` ports for low-level data access.[^3]
- Conforms to repository port naming standards.[^4]

[^1]: [src/ports/IPersistence.js](../../src/ports/IPersistence.js#L1)
[^2]: [tests/ports/testIPersistence.test.js](../../tests/ports/testIPersistence.test.js#L3-L14)
[^3]: [src/ports/IDatabase.js](../../src/ports/IDatabase.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
