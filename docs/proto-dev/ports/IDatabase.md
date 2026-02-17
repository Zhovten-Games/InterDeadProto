---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IDatabase.js
used_by:
  - src/adapters/database/DatabaseAdapter.js
---

# IDatabase Port

Abstracts access to persistent storage engines such as IndexedDB or remote databases.[^1] Adapter implementations handle the specifics while exposing a uniform API to higher layers.[^3]

## Relations
- Ensured to exist through an import test.[^2]
- Serves as the backing store for `IPersistence` services.[^3]
- Adheres to repository naming and location rules for ports.[^4]

[^1]: [src/ports/IDatabase.js](../../src/ports/IDatabase.js#L1)
[^2]: [tests/ports/testIDatabase.test.js](../../tests/ports/testIDatabase.test.js#L3-L14)
[^3]: [src/ports/IPersistence.js](../../src/ports/IPersistence.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
