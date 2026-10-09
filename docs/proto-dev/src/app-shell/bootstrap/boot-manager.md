---
domains: []
emits:
  - BOOT_COMPLETE
  - BOOT_STEP
implements: []
imports:
  - src/runtime-diagnostics/null-logger.js
listens: []
owns:
  - _abort
  - _complete
  - _generation
  - _instances
  - _names
  - _tail
  - booted
  - bus
  - container
  - logger
schemaVersion: 1
source: src/app-shell/bootstrap/boot-manager.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: BootManager
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# BootManager

Управляет managed-service lifecycle: dependency closure и topological order, одна очередь фаз, coalescing повторных boot, timeout и reverse rollback, включая partially booted service. disposeAll инвалидирует текущий lifecycle и ждёт очередь, затем освобождает ресурсы в обратном порядке. completeBoot публикует готовность один раз. unmanaged-service определяется явно в composition и получает отдельного owner.

Проверки: `IDP-WH-BOOT-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/app-shell/bootstrap/boot-manager.js)
