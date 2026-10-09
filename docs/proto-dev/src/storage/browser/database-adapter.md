---
domains: []
emits: []
implements:
  - IDatabase
imports:
  - assets/libs/db/sql-wasm.esm.js
  - src/storage/ports/database-port.js
  - src/asset-delivery/paths/assets-base-url.js
listens: []
owns:
  - _SQL
  - _bootPromise
  - _initSqlJs
  - _transactionDepth
  - _writerRelease
  - _writerTask
  - db
  - logger
  - path
  - storage
schemaVersion: 1
source: src/storage/browser/database-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: DatabaseAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DatabaseAdapter

Владеет SQL.js instance и exclusive browser writer lock. transaction принимает только synchronous callback; SQL/persist failure восстанавливает предыдущий полный snapshot. fork проверяет SQLite integrity и запрещает triggers/views; commitSnapshot сохраняет immutable backups и commits candidate после успешного storage write. Полный import заменяет SQLite/progression/preferences одной записью user-context envelope; без atomic storage contract persistent import отклоняется.

Проверки: `IDP-WH-MIGRATION-001.v1; IDP-WH-PROFILE-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/storage/browser/database-adapter.js)
