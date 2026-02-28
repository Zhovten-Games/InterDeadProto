---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ICanvasFactory.js
used_by:
  - src/adapters/ui/CanvasFactoryAdapter.js
---

# ICanvasFactory

Abstraction for creating canvas surfaces used across the application. The factory produces `HTMLCanvasElement` instances (or other canvas implementations) given width and height values[^1]. `CanvasFactoryAdapter` provides the concrete implementation, while services like `ItemOverlayService` and `CameraOrchestratorService` request an instance via the dependency container[^2][^3].

[^1]: [src/ports/ICanvasFactory.js](../../src/ports/ICanvasFactory.js#L1-L9)
[^2]: [src/adapters/ui/CanvasFactoryAdapter.js](../../src/adapters/ui/CanvasFactoryAdapter.js#L1-L18)
[^3]: [src/application/services/ItemOverlayService.js](../../src/application/services/ItemOverlayService.js#L8-L12)
