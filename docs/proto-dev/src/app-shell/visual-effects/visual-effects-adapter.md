---
domains: []
emits: []
implements:
  - IVisualEffects
imports:
  - src/app-shell/ports/visual-effects-port.js
listens: []
owns:
  - logger
schemaVersion: 1
source: src/app-shell/visual-effects/visual-effects-adapter.js
used_by: []
source_exists: true
runtime_role: VisualEffectsAdapter
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# VisualEffectsAdapter

Reserved module intended to provide DOM visual effects in future iterations. It will implement the `IVisualEffects` port but currently contains no functionality[^1][^2].

[^1]: [`VisualEffectsAdapter.js`](../../../../../proto-dev/src/app-shell/visual-effects/visual-effects-adapter.js)

[^2]: [`IVisualEffects.js`](../../../../../proto-dev/src/app-shell/ports/visual-effects-port.js)
