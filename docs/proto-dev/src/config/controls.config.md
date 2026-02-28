---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/controls.config.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
  - src/presentation/widgets/ControlPanel/index.js
---

# Controls Configuration

Declares named control sections with button definitions for each UI screen, including messenger, camera, and registration.
`screenMap` associates these sections to screens, while `scrollControls` names the chat scroll arrows so panel widgets can map
directional events.[^1] A control panel flag controls whether the emoji drum is rendered for the messenger view so the UI can be
decluttered without removing layout code; the default app config keeps it disabled unless explicitly enabled.[^2][^3]

During bootstrap the sections and screen map are registered for dependency injection, letting `PanelAdapter` and
`ControlPanel` hydrate the proper templates and emit scroll requests.[^4]

[^1]: Section definitions and scroll slots [src/config/controls.config.js#L1-L63](../../src/config/controls.config.js#L1-L63)
[^2]: Emoji drum visibility toggle [src/config/controls.config.js#L5-L7](../../src/config/controls.config.js#L5-L7)
[^3]: Default config hides the drum [src/config/default.config.js#L13-L19](../../src/config/default.config.js#L13-L19)
[^4]: Registration in the bootstrap container [src/infrastructure/bootstrap/index.js#L200-L232](../../src/infrastructure/bootstrap/index.js#L200-L232); panel hydration [src/presentation/widgets/ControlPanel/index.js#L9-L98](../../src/presentation/widgets/ControlPanel/index.js#L9-L98)
