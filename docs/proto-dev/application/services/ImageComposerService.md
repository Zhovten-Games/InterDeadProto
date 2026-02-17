---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ImageComposerService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ImageComposerService

Builds composite images by layering camera frames, optional backgrounds, and overlays on canvases supplied by the `ICanvasFactory` port.[^1][^2] The `compose` workflow normalises drawables from DOM elements, URLs, or blobs, applies crop metadata, paints overlays, and emits full plus thumbnail blobs along with bookkeeping metadata for downstream persistence.[^3] Helper routines manage image loading, blob conversion, and canvas creation so adapters only need to satisfy the canvas factory contract that `InfrastructureModule` exports.[^4][^5]

[^1]: [`ImageComposerService.js`](../../src/application/services/ImageComposerService.js#L5-L14)
[^2]: [`ApplicationModule.js`](../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L170-L178)
[^3]: [`ImageComposerService.js`](../../src/application/services/ImageComposerService.js#L16-L68)
[^4]: [`ImageComposerService.js`](../../src/application/services/ImageComposerService.js#L70-L157)
[^5]: [`InfrastructureModule.js`](../../src/infrastructure/bootstrap/modules/InfrastructureModule.js#L123-L124)
