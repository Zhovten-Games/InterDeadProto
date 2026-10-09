---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/visual-effects/effects-config.js
used_by:
  - src/narrative-runtime/effects/effects-manager.js
source_exists: true
runtime_role: effects-config
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# effects.config.js

Central configuration for presentation effects. Defines the `electricBorder` target with the panel selector, modifier class used by `PanelEffectsWidget`, the canvas dataset key, and default stroke parameters (speed, offset, radius, line width, color) consumed by both the widget and `EffectsManager`.[^1]

[^1]: Electric border defaults [src/app-shell/visual-effects/effects-config.js#L1-L19](../../../../../proto-dev/src/app-shell/visual-effects/effects-config.js)
