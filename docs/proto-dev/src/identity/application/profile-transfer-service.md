---
title: ProfileTransferService
domains: []
emits:
  - GHOST_CHANGE
  - PROFILE_EXPORT_READY
  - PROFILE_IMPORT_COMPLETED
  - PROFILE_TRANSFER_FAILED
implements: []
imports:
  - src/messenger/persistence/dialog-repository.js
  - src/media/persistence/media-repository.js
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/identity/configuration/profile-ui-preferences-config.js
listens:
  - PROFILE_EXPORT_CONFIRMED
  - PROFILE_IMPORT_SELECTED
owns:
  - _booted
  - _handler
  - allowedGhosts
  - bus
  - contextConsumers
  - ghostService
  - historyService
  - logger
  - persistence
  - postsService
  - profileService
schemaVersion: 1
source: src/identity/application/profile-transfer-service.js
source_exists: true
runtime_role: ProfileTransferService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
used_by:
  - src/app-shell/composition/application-module.js
---

# ProfileTransferService

Event-facing export/import owner. Export включает versioned full SQLite snapshot, per-ghost posts/history, current ghost, preferences и progress. Import decrypts/prepares/validates candidate, migrates private fork, сверяет snapshot/profile identity и commits DB+context атомарно. Unknown spirits и conflicting data отвергаются до commit. После успеха обновляются declared context consumers и запрашивается ghost transition. PROFILE_TRANSFER_FAILED сохраняет прежний save; профиль-only test compatibility port имеет явный ограниченный scope.

Проверки: `IDP-WH-PROFILE-001.v1; manual.legacy-import-recovery`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/identity/application/profile-transfer-service.js)
