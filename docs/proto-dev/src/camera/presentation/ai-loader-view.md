---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/constants.js
listens:
  - AI_STATE_CHANGED
owns:
  - _handler
  - aiState
  - bus
  - orchestrator
schemaVersion: 1
source: src/camera/presentation/ai-loader-view.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: AiLoaderView
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# AiLoaderView

Creates a fullscreen AI loader overlay with localized status text, hide/retry actions, and an animated contact line powered by `TypewriterCascadeEffect`. The overlay is appended to `[data-js="global-content"]` (or `document.body`) and localized on creation.[^1]

The widget listens for `AI_STATE_CHANGED` and `AI_LOADER_VISIBILITY_CHANGED` to decide when to show the overlay, update status labels, and reveal the retry button. It emits `AI_LOADER_HIDE_REQUESTED` and `AI_RETRY_REQUESTED` when users interact with the loader controls.[^2]

[^1]: Overlay markup, action bindings, and initialization [src/camera/presentation/ai-loader-view.js#L18-L75](../../../../../proto-dev/src/camera/presentation/ai-loader-view.js)

[^2]: Event handling, render logic, and contact animation [src/camera/presentation/ai-loader-view.js#L76-L155](../../../../../proto-dev/src/camera/presentation/ai-loader-view.js)
