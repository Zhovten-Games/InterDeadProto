---
schemaVersion: 1
source: src/messenger/history/dialog-timeline.js
source_exists: true
runtime_role: DialogTimeline
contour_primary: messenger
role_group: capability_module
imports:
  - src/runtime-events/domain/constants.js
implements: []
owns:
  - bus
  - history
  - listeners
  - snapshot
listens: []
emits:
  - DIALOG_HISTORY_REPLACED
used_by:
  - src/messenger/application/dialog-orchestrator-service.js
  - src/app-shell/composition/application-module.js
---

# DialogTimeline

Authoritative per-spirit presentation snapshot хранит ghost, revision и canonical accepted sequence. accept сохраняет сообщение до live publication; replaceMessages публикует атомарный snapshot и объединяет concurrent accepted live append по identity/sequence. subscribe сразу отдаёт retained snapshot позднему widget. Stale ghost/revision отвергаются; replay не вызывает live narrative/camera/reaction effects.

Проверки: `IDP-WH-HISTORY-001.v1; IDP-WH-RESTORE-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/messenger/history/dialog-timeline.js)
