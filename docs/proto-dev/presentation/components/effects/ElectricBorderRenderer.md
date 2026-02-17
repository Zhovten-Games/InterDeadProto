---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/components/effects/ElectricBorderRenderer.js
used_by:
  - src/presentation/widgets/PanelEffectsWidget.js
---

# ElectricBorderRenderer

Canvas renderer for the control-panel border. It attaches to a canvas, merges caller settings, and starts an animation loop that keeps stroke styling in sync with runtime configuration supplied by `PanelEffectsWidget` or `EffectsManager`.[^1]

`resize` respects device pixel ratio, resizes the drawing surface, and recomputes bounds so the electric frame hugs the panel. Each frame clears the canvas, clamps the border offset/radius, and traces a precise rounded rectangle before stroking it—removing the noisy perturbations from earlier revisions.[^2]

[^1]: Construction, attachment, update, and animation lifecycle [src/presentation/components/effects/ElectricBorderRenderer.js#L1-L58](../../../../src/presentation/components/effects/ElectricBorderRenderer.js#L1-L58)
[^2]: Resize handling and rounded-rectangle rendering [src/presentation/components/effects/ElectricBorderRenderer.js#L67-L153](../../../../src/presentation/components/effects/ElectricBorderRenderer.js#L67-L153)
