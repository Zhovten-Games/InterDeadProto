---
domains: []
emits:
  - log
implements: []
imports:
  - src/presentation/components/dialog/animations/TypewriterCascadeEffect.js
  - src/presentation/components/loader/LoaderModuleNameProvider.js
listens:
  - OVERLAY_HIDE
  - OVERLAY_SHOW
  - OVERLAY_STEP
owns: []
schemaVersion: 1
source: src/presentation/widgets/LoaderView.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# LoaderView

Creates a fullscreen overlay with a localized headline, step list, and optional `TypewriterCascadeEffect` to animate loader module names supplied by `LoaderModuleNameProvider`. The overlay attaches itself to `[data-js="global-content"]` so it persists while the main view hydrates.[^1]

`OVERLAY_SHOW`, `OVERLAY_HIDE`, and `OVERLAY_STEP` events rebuild the overlay message, clear completed steps, and append new list items while emitting diagnostic `log` events for traceability.[^2]

Step animations run sequentially via an internal promise queue. Each step obtains a cancellable controller so closing the overlay or switching locales aborts pending effects before the final text is restored.[^3]

[^1]: Construction, overlay DOM, and localization hooks [src/presentation/widgets/LoaderView.js#L1-L56](../../../src/presentation/widgets/LoaderView.js#L1-L56)
[^2]: Event handling and logging inside `_handle` [src/presentation/widgets/LoaderView.js#L58-L107](../../../src/presentation/widgets/LoaderView.js#L58-L107)
[^3]: Animation queue, abort handling, and label resolution [src/presentation/widgets/LoaderView.js#L108-L181](../../../src/presentation/widgets/LoaderView.js#L108-L181)
