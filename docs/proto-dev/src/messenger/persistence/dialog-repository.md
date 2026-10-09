---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - db
schemaVersion: 1
source: src/messenger/persistence/dialog-repository.js
used_by:
  - src/identity/application/profile-transfer-service.js
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogRepository
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# DialogRepository

Schema v2 хранит неизменяемую fingerprint/ghost identity, original timestamp/stage/media и unique ghost+sequence. appendUnique атомарно выделяет sequence, duplicate accepted identity сохраняет исходные created metadata. Reaction update — отдельный контракт. Legacy migration до изменения создаёт backup и deterministic chronology ts/order_idx/rowid/fingerprint; повторная миграция идемпотентна. replaceAll проверяет conflicting identity/sequence до commit.

Проверки: `IDP-WH-HISTORY-001.v1; IDP-WH-MIGRATION-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/messenger/persistence/dialog-repository.js)
