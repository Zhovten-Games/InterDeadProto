---
schemaVersion: 1
source: src/contact-sessions/application/contact-transition-controller.js
source_exists: true
runtime_role: ContactTransitionController
contour_primary: contact-sessions
role_group: capability_module
imports: []
implements: []
owns:
  - committed
  - requested
  - revision
listens: []
emits: []
used_by:
  - src/messenger/application/dialog-orchestrator-service.js
---

# ContactTransitionController

request увеличивает switch revision, асинхронно подготавливает candidate и commits только latest valid revision. A→B→A имеет три distinct requests. cancel/reset инвалидируют pending preparations. Наружу exposed public transition contract; DOM/persistence/narrative находятся у собственных владельцев.

Проверки: `IDP-WH-SWITCH-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/contact-sessions/application/contact-transition-controller.js)
