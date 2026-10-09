---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/storage/ports/database-publisher-port.js
used_by:
  - src/storage/publication/db-publisher.js
source_exists: true
runtime_role: IDatabasePublisher
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IDatabasePublisher Port

Defines a mechanism for broadcasting database changes to interested subscribers.[^1] Implementations typically wrap a database adapter and emit events when records mutate.[^3]

## Relations

- Guarded by a basic import test.[^2]
- Works in tandem with `IDatabase` to propagate updates.[^3]
- Conforms to the standard port naming scheme.[^4]

[^1]: [src/storage/ports/database-publisher-port.js](../../../../../proto-dev/src/storage/ports/database-publisher-port.js)

[^2]: [tests/ports/testIDatabasePublisher.test.js](../../../../../proto-dev/tests/storage/test-i-database-publisher.test.js)

[^3]: [src/storage/ports/database-port.js](../../../../../proto-dev/src/storage/ports/database-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
