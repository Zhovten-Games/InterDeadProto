---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _booted
  - bus
  - documentRef
  - languageManager
  - orchestrator
  - overlayRoot
  - state
  - unsubscribe
  - windowRef
schemaVersion: 1
source: src/app-shell/overlays/presentation/unified-overlay-view.js
source_exists: true
runtime_role: UnifiedOverlayView
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
used_by:
  - src/app-shell/composition/presentation-module.js
---

# UnifiedOverlayView

Provides unified overlay composition for status, loading, and transient runtime hints.
