---
domains: []
emits: []
implements:
  - ICanvasFactory
imports:
  - src/media/ports/canvas-factory-port.js
listens: []
owns: []
schemaVersion: 1
source: src/media/browser/canvas-factory-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: CanvasFactoryAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# CanvasFactoryAdapter

Provides DOM `<canvas>` elements for services that need drawing surfaces. It implements `ICanvasFactory` and deliberately avoids `OffscreenCanvas` because it lacks APIs such as `toDataURL` that the overlay pipeline requires.[^1] The adapter is consumed by `ImageComposerService` for blending frames, `ItemOverlayService` for quest masks, and `CameraOrchestratorService` when coordinating overlays.[^2][^3][^4]

[^1]: [`CanvasFactoryAdapter.js`](../../../../../proto-dev/src/media/browser/canvas-factory-adapter.js)

[^2]: [`ImageComposerService.js`](../../../../../proto-dev/src/media/composition/image-composer-service.js)

[^3]: [`ItemOverlayService.js`](../../../../../proto-dev/src/quests/presentation/item-overlay-service.js)

[^4]: [`CameraOrchestratorService.js`](../../../../../proto-dev/src/camera/application/camera-orchestrator-service.js)
