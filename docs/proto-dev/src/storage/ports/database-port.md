---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/storage/ports/database-port.js
used_by:
  - src/storage/browser/database-adapter.js
source_exists: true
runtime_role: IDatabase
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IDatabase Port

Abstracts access to persistent storage engines such as IndexedDB or remote databases.[^1] Adapter implementations handle the specifics while exposing a uniform API to higher layers.[^3]

## Relations

- Ensured to exist through an import test.[^2]
- Serves as the backing store for `IPersistence` services.[^3]
- Adheres to repository naming and location rules for ports.[^4]

[^1]: [src/storage/ports/database-port.js](../../../../../proto-dev/src/storage/ports/database-port.js)

[^2]: [tests/ports/testIDatabase.test.js](../../../../../proto-dev/tests/storage/test-i-database.test.js)

[^3]: [src/storage/ports/persistence-port.js](../../../../../proto-dev/src/storage/ports/persistence-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
