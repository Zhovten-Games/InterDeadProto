---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IDatabasePublisher.js
used_by:
  - src/adapters/database/DBPublisher.js
---

# IDatabasePublisher Port

Defines a mechanism for broadcasting database changes to interested subscribers.[^1] Implementations typically wrap a database adapter and emit events when records mutate.[^3]

## Relations
- Guarded by a basic import test.[^2]
- Works in tandem with `IDatabase` to propagate updates.[^3]
- Conforms to the standard port naming scheme.[^4]

[^1]: [src/ports/IDatabasePublisher.js](../../src/ports/IDatabasePublisher.js#L1)
[^2]: [tests/ports/testIDatabasePublisher.test.js](../../tests/ports/testIDatabasePublisher.test.js#L3-L14)
[^3]: [src/ports/IDatabase.js](../../src/ports/IDatabase.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
