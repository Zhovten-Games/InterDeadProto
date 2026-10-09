---
title: AuthLoginResolver
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - authVisibilityAdapter
  - logger
schemaVersion: 1
source: src/identity/authentication/auth-login-resolver.js
source_exists: true
runtime_role: AuthLoginResolver
contour_primary: AUTH-GHOST
contour_secondary: none
role_group: anomaly_layer
narrative_role: identity anomaly mediator
used_by:
  - src/app-shell/composition/application-module.js
---

# AuthLoginResolver

Resolves effective login identity for auth-aware flows. Source: `proto-dev/src/identity/authentication/auth-login-resolver.js`.
