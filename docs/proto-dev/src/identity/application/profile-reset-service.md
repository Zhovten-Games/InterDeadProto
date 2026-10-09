---
domains: []
emits:
  - APP_RESET_COMPLETED
  - SCREEN_CHANGE
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _booted
  - _handler
  - bus
  - config
  - database
  - logger
  - persistence
  - runtimeResetServices
schemaVersion: 1
source: src/identity/application/profile-reset-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ResetService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Profile reset

Reset очищает project user context и runtime projections через public reset ports, сохраняет loaded model/worker и host infrastructure. Database user rows удаляются в atomic transaction; persistence clear ограничен owned keys. APP_RESET_COMPLETED возвращает UI в объявленный initial screen. Ошибка reset журналируется и completion не публикуется.

Проверки: `manual.reset-preserves-infrastructure; complete-unit-corpus`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/identity/application/profile-reset-service.js)
