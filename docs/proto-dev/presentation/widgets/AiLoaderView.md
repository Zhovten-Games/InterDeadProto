---
domains: []
emits:
  - AI_LOADER_HIDE_REQUESTED
  - AI_RETRY_REQUESTED
implements: []
imports:
  - src/core/events/constants.js
  - src/presentation/components/dialog/animations/TypewriterCascadeEffect.js
listens:
  - AI_LOADER_VISIBILITY_CHANGED
  - AI_STATE_CHANGED
owns: []
schemaVersion: 1
source: src/presentation/widgets/AiLoaderView.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# AiLoaderView

Creates a fullscreen AI loader overlay with localized status text, hide/retry actions, and an animated contact line powered by `TypewriterCascadeEffect`. The overlay is appended to `[data-js="global-content"]` (or `document.body`) and localized on creation.[^1]

The widget listens for `AI_STATE_CHANGED` and `AI_LOADER_VISIBILITY_CHANGED` to decide when to show the overlay, update status labels, and reveal the retry button. It emits `AI_LOADER_HIDE_REQUESTED` and `AI_RETRY_REQUESTED` when users interact with the loader controls.[^2]

[^1]: Overlay markup, action bindings, and initialization [src/presentation/widgets/AiLoaderView.js#L18-L75](../../../src/presentation/widgets/AiLoaderView.js#L18-L75)
[^2]: Event handling, render logic, and contact animation [src/presentation/widgets/AiLoaderView.js#L76-L155](../../../src/presentation/widgets/AiLoaderView.js#L76-L155)
