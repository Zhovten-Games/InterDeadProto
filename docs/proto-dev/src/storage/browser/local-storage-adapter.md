---
domains: []
emits: []
implements:
  - IPersistence
imports:
  - src/storage/ports/persistence-port.js
listens: []
owns:
  - storage
schemaVersion: 1
source: src/storage/browser/local-storage-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: LocalStorageAdapter
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# LocalStorageAdapter

Объявленная project persistence boundary. До import читает legacy keys; после replaceOwned authoritative envelope interdead:user-context:v1 объединяет SQLite, progress и prefs. Одна setItem commits всю замену; отсутствующий owned key в envelope не возрождается из legacy. exportUserProgress фильтрует quest/duality/completion/reaction/checkpoint keys; backupUserContext сохраняет pre-import context однократно. clear удаляет user-owned keys и оставляет unrelated host storage и immutable backups.

Проверки: `IDP-WH-PROFILE-001.v1; manual.reset-preserves-infrastructure`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/storage/browser/local-storage-adapter.js)
