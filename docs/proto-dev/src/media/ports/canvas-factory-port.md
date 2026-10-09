---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/media/ports/canvas-factory-port.js
used_by:
  - src/media/browser/canvas-factory-adapter.js
source_exists: true
runtime_role: ICanvasFactory
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ICanvasFactory

Abstraction for creating canvas surfaces used across the application. The factory produces `HTMLCanvasElement` instances (or other canvas implementations) given width and height values[^1]. `CanvasFactoryAdapter` provides the concrete implementation, while services like `ItemOverlayService` and `CameraOrchestratorService` request an instance via the dependency container[^2][^3].

[^1]: [src/media/ports/canvas-factory-port.js](../../../../../proto-dev/src/media/ports/canvas-factory-port.js)

[^2]: [src/media/browser/canvas-factory-adapter.js](../../../../../proto-dev/src/media/browser/canvas-factory-adapter.js)

[^3]: [src/quests/presentation/item-overlay-service.js](../../../../../proto-dev/src/quests/presentation/item-overlay-service.js)
