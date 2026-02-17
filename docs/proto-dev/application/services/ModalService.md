---
domains: []
emits:
  - MODAL_HIDE
  - MODAL_SHOW
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - OVERLAY_SHOW
owns: []
schemaVersion: 1
source: src/application/services/ModalService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ModalService

Provides a global mechanism for showing and hiding modal overlays. It subscribes to `OVERLAY_SHOW` events and exposes helpers to emit `MODAL_SHOW` or `MODAL_HIDE` signals through the injected event bus (`NullEventBus` fallback)[^1][^2]. When given a data URL it reconstructs an image before displaying it[^3].

These events rely on the shared constants defined in the core event list[^4].

[^1]: [src/application/services/ModalService.js](../../src/application/services/ModalService.js#L1-L28)
[^2]: [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: [src/application/services/ModalService.js](../../src/application/services/ModalService.js#L30-L46)
[^4]: [src/core/events/constants.js](../../src/core/events/constants.js#L24-L31)
