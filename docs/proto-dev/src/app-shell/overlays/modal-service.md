---
domains: []
emits:
  - MODAL_HIDE
  - MODAL_SHOW
  - SCREEN_CHANGE
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - OVERLAY_SHOW
owns:
  - _handler
  - actionsBuilder
  - bus
  - onMessenger
schemaVersion: 1
source: src/app-shell/overlays/modal-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ModalService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ModalService

Provides a global mechanism for showing and hiding modal overlays. It subscribes to `OVERLAY_SHOW` events and exposes helpers to emit `MODAL_SHOW` or `MODAL_HIDE` signals through the injected event bus (`NullEventBus` fallback)[^1][^2]. When given a data URL it reconstructs an image before displaying it[^3].

These events rely on the shared constants defined in the core event list[^4].

[^1]: [src/app-shell/overlays/modal-service.js](../../../../../proto-dev/src/app-shell/overlays/modal-service.js)

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: [src/app-shell/overlays/modal-service.js](../../../../../proto-dev/src/app-shell/overlays/modal-service.js)

[^4]: [src/runtime-events/domain/constants.js](../../../../../proto-dev/src/runtime-events/domain/constants.js)
