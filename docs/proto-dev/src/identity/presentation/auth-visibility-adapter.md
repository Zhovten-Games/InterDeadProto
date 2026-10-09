---
title: AuthVisibilityAdapter
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _handlePortsReady
  - _listeners
  - _portUnsubscribe
  - logger
  - port
  - snapshot
  - windowRef
schemaVersion: 1
source: src/identity/presentation/auth-visibility-adapter.js
source_exists: true
runtime_role: AuthVisibilityAdapter
contour_primary: SAL-SWITCH
contour_secondary: none
role_group: salience_threat
narrative_role: access visibility switch
used_by:
  - src/app-shell/composition/infrastructure-module.js
---

# AuthVisibilityAdapter

Controls visibility of authentication-related UI blocks based on runtime state. Source: `proto-dev/src/identity/presentation/auth-visibility-adapter.js`.
