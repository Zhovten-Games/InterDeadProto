---
domains: []
emits:
  - SCREEN_CHANGE
implements: []
imports: []
listens: []
owns:
  - _bootPromise
  - _ready
  - _unloadHandler
  - bootManager
  - container
  - eventBus
  - logger
  - windowRef
schemaVersion: 1
source: src/app-shell/bootstrap/full-app-bootstrapper.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: FullAppBootstrapper
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# FullAppBootstrapper

Последовательно запускает ранний loader/UI phase и оставшиеся managed services через BootManager. \_restoreState выбирает welcome/registration/messenger из сохранённого профиля; database fallback восстанавливает отсутствующие userId/captured без очистки существующего SQLite. beforeunload subscription принадлежит bootstrapper и удаляется при dispose. Повторный boot coalesces; отказ вызывает cleanup и допускает новый cycle.

Проверки: `IDP-WH-BOOT-001.v1; browser-profile-reload-subpath`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/app-shell/bootstrap/full-app-bootstrapper.js)
