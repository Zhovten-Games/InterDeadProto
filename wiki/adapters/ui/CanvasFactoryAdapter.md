---
domains: []
emits: []
implements: []
imports:
  - src/ports/ICanvasFactory.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ui/CanvasFactoryAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# CanvasFactoryAdapter

Provides DOM `<canvas>` elements for services that need drawing surfaces. It implements `ICanvasFactory` and deliberately avoids `OffscreenCanvas` because it lacks APIs such as `toDataURL` that the overlay pipeline requires.[^1] The adapter is consumed by `ImageComposerService` for blending frames, `ItemOverlayService` for quest masks, and `CameraOrchestratorService` when coordinating overlays.[^2][^3][^4]

[^1]: [`CanvasFactoryAdapter.js`](../../../src/adapters/ui/CanvasFactoryAdapter.js#L1-L18)
[^2]: [`ImageComposerService.js`](../../../src/application/services/ImageComposerService.js#L5-L68)
[^3]: [`ItemOverlayService.js`](../../../src/application/services/ItemOverlayService.js#L8-L12)
[^4]: [`CameraOrchestratorService.js`](../../../src/application/services/CameraOrchestratorService.js#L403-L433)
