---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - activeCardId
  - debounceMs
  - entries
  - entryUpdateTimers
  - lastTransitionAt
  - lastTransitionSource
  - listeners
  - mode
  - stage
  - transitionPolicy
schemaVersion: 1
source: src/app-shell/overlays/overlay-orchestrator-service.js
source_exists: true
runtime_role: OVERLAY_STAGE
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
used_by:
  - src/app-shell/composition/presentation-module.js
---

# OverlayOrchestratorService

Coordinates visual overlay transitions and state handoffs across runtime scenes.
