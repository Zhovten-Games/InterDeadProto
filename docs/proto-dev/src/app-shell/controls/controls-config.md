---
domains: []
emits: []
implements: []
imports:
  - src/app-shell/composition/configuration-index.js
  - src/messenger/configuration/chat-config.js
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/controls/controls-config.js
used_by:
  - src/app-shell/composition/presentation-module.js
  - src/app-shell/controls/presentation/control-panel-widget.js
source_exists: true
runtime_role: controlPanelOptions
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Controls Configuration

Declares named control sections with button definitions for each UI screen, including messenger, camera, and registration.
`screenMap` associates these sections to screens, while `scrollControls` names the chat scroll arrows so panel widgets can map
directional events.[^1] A control panel flag controls whether the emoji drum is rendered for the messenger view so the UI can be
decluttered without removing layout code; the default app config keeps it disabled unless explicitly enabled.[^2][^3]

During bootstrap the sections and screen map are registered for dependency injection, letting `PanelAdapter` and
`ControlPanel` hydrate the proper templates and emit scroll requests.[^4]

[^1]: Section definitions and scroll slots [src/app-shell/controls/controls-config.js#L1-L63](../../../../../proto-dev/src/app-shell/controls/controls-config.js)

[^2]: Emoji drum visibility toggle [src/app-shell/controls/controls-config.js#L5-L7](../../../../../proto-dev/src/app-shell/controls/controls-config.js)

[^3]: Default config hides the drum [src/app-shell/configuration/default-config.js#L13-L19](../../../../../proto-dev/src/app-shell/configuration/default-config.js)

[^4]: Registration in the bootstrap container [src/app-shell/bootstrap/index.js#L200-L232](../../../../../proto-dev/src/app-shell/bootstrap/index.js); panel hydration [src/app-shell/controls/presentation/control-panel-widget.js#L9-L98](../../../../../proto-dev/src/app-shell/controls/presentation/control-panel-widget.js)

The messenger section now includes a dedicated profile settings control (`open-profile-settings`) placed between reset and ghost selection so users can open profile export/effect preferences directly from chat.[^5]

[^5]: Messenger controls list [src/app-shell/controls/controls-config.js#L76-L95](../../../../../proto-dev/src/app-shell/controls/controls-config.js)
