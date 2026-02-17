---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ItemOverlayService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ItemOverlayService

Creates quest item overlays by cropping a region from a selfie and compositing it onto an optional background. It uses an injected `ICanvasFactory` to allocate working surfaces and can apply polygon or image masks before drawing the cropped area onto the target canvas[^1][^2]. The composed layer is later shown by camera orchestration when quests require item placement[^3].

[^1]: [src/application/services/ItemOverlayService.js](../../src/application/services/ItemOverlayService.js#L8-L12)
[^2]: [src/application/services/ItemOverlayService.js](../../src/application/services/ItemOverlayService.js#L15-L59)
[^3]: [src/application/services/CameraOrchestratorService.js](../../src/application/services/CameraOrchestratorService.js#L323-L360)
