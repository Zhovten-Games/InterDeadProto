---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - canvasFactory
schemaVersion: 1
source: src/media/composition/image-composer-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ImageComposerService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ImageComposerService

Builds composite images by layering camera frames, optional backgrounds, and overlays on canvases supplied by the `ICanvasFactory` port.[^1][^2] The `compose` workflow normalises drawables from DOM elements, URLs, or blobs, applies crop metadata, paints overlays, and emits full plus thumbnail blobs along with bookkeeping metadata for downstream persistence.[^3] Helper routines manage image loading, blob conversion, and canvas creation so adapters only need to satisfy the canvas factory contract that `InfrastructureModule` exports.[^4][^5]

[^1]: [`ImageComposerService.js`](../../../../../proto-dev/src/media/composition/image-composer-service.js)

[^2]: [`ApplicationModule.js`](../../../../../proto-dev/src/app-shell/composition/application-module.js)

[^3]: [`ImageComposerService.js`](../../../../../proto-dev/src/media/composition/image-composer-service.js)

[^4]: [`ImageComposerService.js`](../../../../../proto-dev/src/media/composition/image-composer-service.js)

[^5]: [`InfrastructureModule.js`](../../../../../proto-dev/src/app-shell/composition/infrastructure-module.js)
