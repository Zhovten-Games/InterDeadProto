---
domains: []
emits: []
implements: []
imports:
  - '@interdead/framework'
  - src/identity/configuration/profile-ui-preferences-config.js
listens: []
owns:
  - boundDelegatedClickHandler
  - boundDelegatedFocusHandler
  - boundDelegatedPointerHandler
  - boundDelegatedTouchHandler
  - boundPreferencesHandler
  - delegatedSelector
  - documentRef
  - logger
  - persistence
  - preferences
  - runtime
  - windowRef
schemaVersion: 1
source: src/host-integration/framework/framework-bridge.js
source_exists: true
runtime_role: FrameworkBridge
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
used_by:
  - src/app-shell/bootstrap/application-bootstrap.js
---

# FrameworkBridge

Bridges framework lifecycle hooks into the bootstrap runtime pipeline.
