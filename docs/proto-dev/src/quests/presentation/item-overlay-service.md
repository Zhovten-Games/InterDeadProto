---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - canvasFactory
schemaVersion: 1
source: src/quests/presentation/item-overlay-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ItemOverlayService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ItemOverlayService

Creates quest item overlays by cropping a region from a selfie and compositing it onto an optional background. It uses an injected `ICanvasFactory` to allocate working surfaces and can apply polygon or image masks before drawing the cropped area onto the target canvas[^1][^2]. The composed layer is later shown by camera orchestration when quests require item placement[^3].

[^1]: [src/quests/presentation/item-overlay-service.js](../../../../../proto-dev/src/quests/presentation/item-overlay-service.js)

[^2]: [src/quests/presentation/item-overlay-service.js](../../../../../proto-dev/src/quests/presentation/item-overlay-service.js)

[^3]: [src/camera/application/camera-orchestrator-service.js](../../../../../proto-dev/src/camera/application/camera-orchestrator-service.js)
