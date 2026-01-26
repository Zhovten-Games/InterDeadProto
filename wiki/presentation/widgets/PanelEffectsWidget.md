---
domains: []
emits: []
implements: []
imports:
  - src/config/effects.config.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
  - src/presentation/components/effects/ElectricBorderRenderer.js
listens:
  - EFFECT_STYLE_UPDATED
owns: []
schemaVersion: 1
source: src/presentation/widgets/PanelEffectsWidget.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# PanelEffectsWidget

Presentation widget that renders the electric border canvas around the control panel. It subscribes to `EFFECT_STYLE_UPDATED` via an injected bus (`NullEventBus` fallback), ensures the target container gets the configured `effectClass`, creates a canvas tagged by `canvasDatasetKey`, and forwards configuration updates to `ElectricBorderRenderer`. `NullLogger` keeps mounting test friendly without infrastructure logging.[^1][^2]

Mounting guarantees a canvas exists, starts the renderer, and attaches a `ResizeObserver` so the canvas tracks responsive panel bounds; disposal stops animation, disconnects observers, removes effect classes, and clears references so subsequent mounts reinitialise cleanly.[^2]

[^1]: Event handling, bus default, canvas setup, and renderer management [src/presentation/widgets/PanelEffectsWidget.js#L1-L117](../../../src/presentation/widgets/PanelEffectsWidget.js#L1-L117); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^2]: [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^3]: Resize observation and teardown workflow [src/presentation/widgets/PanelEffectsWidget.js#L118-L162](../../../src/presentation/widgets/PanelEffectsWidget.js#L118-L162)
