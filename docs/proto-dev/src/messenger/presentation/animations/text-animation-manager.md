---
schemaVersion: 1
source: src/messenger/presentation/animations/text-animation-manager.js
source_exists: true
runtime_role: TextAnimationManager
contour_primary: messenger
role_group: capability_module
imports: []
implements: []
owns:
  - _activeControllers
  - _queue
  - _revision
  - configuration
  - effects
  - language
  - logger
listens: []
emits: []
used_by:
  - src/messenger/presentation/dialog-widget.js
---

# TextAnimationManager

Сериализует typewriter presentation задачи; replay показывается без live typewriter effects. reset/dispose инвалидируют generation и завершают pending timers. Старый callback не изменяет DOM нового snapshot. Сервис не определяет persisted chronology и progression.

reset создаёт новую очередь для текущего контекста и abort-ит собственные active
controllers. Новая projection не ждёт старую translation/effect promise; её поздний
результат отклоняется проверкой generation. Внутри одного контекста эффекты остаются
последовательными.

Проверки: `IDP-WH-RESTORE-001.v1; complete-unit-corpus`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../../proto-dev/src/messenger/presentation/animations/text-animation-manager.js)
