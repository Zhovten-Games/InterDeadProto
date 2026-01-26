---
domains: []
emits: []
implements: []
imports:
  - assets/libs/db/sql-wasm.esm.js
  - src/ports/IDatabase.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/database/DatabaseAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# DatabaseAdapter

Bootstraps an in-memory SQLite database using SQL.js and creates application tables for profiles, exports, locations, selfies, posts, and dialog history on startup.[^1] Database state is persisted between sessions through a pluggable storage adapter such as `LocalStorageAdapter`, with `_toBase64` chunking exports to avoid `Function.apply` argument limits.[^2]

The adapter exposes helpers used by higher-level services: `saveUser`, `recordExport`, and `clearAll` coordinate profile lifecycle tasks, while `fetchAll`, `exec`, and `run` provide promise-friendly wrappers that automatically persist the serialized database after each mutation.[^3]

[^1]: Schema creation during `boot()` [src/adapters/database/DatabaseAdapter.js#L15-L78](../../../src/adapters/database/DatabaseAdapter.js#L15-L78)
[^2]: Persistence helpers and chunked base64 conversion [src/adapters/database/DatabaseAdapter.js#L84-L106](../../../src/adapters/database/DatabaseAdapter.js#L84-L106); storage wiring [src/adapters/persistence/LocalStorageAdapter.js#L1-L33](../../../src/adapters/persistence/LocalStorageAdapter.js#L1-L33)
[^3]: CRUD helpers and profile/export integration [src/adapters/database/DatabaseAdapter.js#L108-L199](../../../src/adapters/database/DatabaseAdapter.js#L108-L199)
