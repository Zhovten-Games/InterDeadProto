---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/constants.js
listens:
  - OVERLAY_HIDE
owns:
  - _booted
  - _handler
  - bus
  - orchestrator
schemaVersion: 1
source: src/app-shell/presentation/boot-overlay-view.js
source_exists: true
runtime_role: BootOverlayView
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
used_by:
  - src/app-shell/composition/presentation-module.js
---

# BootOverlayView

Renders startup overlay state to communicate boot progress and readiness.
