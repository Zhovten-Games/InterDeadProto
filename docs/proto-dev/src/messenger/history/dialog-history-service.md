---
domains: []
emits: []
implements: []
imports:
  - src/messenger/identity/message-fingerprint.js
listens:
  - image
owns:
  - _seen
  - repo
schemaVersion: 1
source: src/messenger/history/dialog-history-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogHistoryService
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# DialogHistoryService

Нормализует message ports и вызывает repository append/load/reaction contracts. Persisted history определяет order; runtime seen cache поддерживает dedup и очищается отдельно при context reset. prepareImport валидирует историю до authoritative write; export сохраняет media references, reaction state, immutable occurrence и sequence.

Проверки: `IDP-WH-HISTORY-001.v1; IDP-WH-PROFILE-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/messenger/history/dialog-history-service.js)
