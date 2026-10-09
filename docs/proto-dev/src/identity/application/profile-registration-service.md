---
domains: []
emits:
  - USER_PROFILE_SAVED
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _exported
  - _imported
  - avatar
  - bus
  - db
  - enc
  - logger
  - name
  - stateService
schemaVersion: 1
source: src/identity/application/profile-registration-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ProfileRegistrationService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ProfileRegistrationService

Владеет profile name/avatar и импортным/экспортным lifecycle. prepareImport проверяет schema 1/2, object/name/avatar до authoritative write. saveProfile устанавливает presence/auth и публикует USER_PROFILE_SAVED только после успешного DB save. Export сохраняет исходную creation date, full snapshot и metadata; imports update runtime context после durable commit.

Проверки: `IDP-WH-PROFILE-001.v1; complete-unit-corpus`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/identity/application/profile-registration-service.js)
