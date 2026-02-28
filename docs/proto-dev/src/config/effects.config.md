---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/effects.config.js
used_by:
  - src/application/services/EffectsManager.js
  - src/presentation/widgets/PanelEffectsWidget.js
---

# effects.config.js

Central configuration for presentation effects. Defines the `electricBorder` target with the panel selector, modifier class used by `PanelEffectsWidget`, the canvas dataset key, and default stroke parameters (speed, offset, radius, line width, color) consumed by both the widget and `EffectsManager`.[^1]

[^1]: Electric border defaults [src/config/effects.config.js#L1-L19](../../src/config/effects.config.js#L1-L19)
