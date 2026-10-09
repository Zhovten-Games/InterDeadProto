---
title: EmbedPermissionsResolver
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _cached
  - documentRef
  - logger
  - requiredPermissions
schemaVersion: 1
source: src/host-integration/embedding/embed-permissions-resolver.js
source_exists: true
runtime_role: EmbedPermissionsResolver
contour_primary: AUTH-GHOST
contour_secondary: none
role_group: anomaly_layer
narrative_role: identity anomaly mediator
used_by:
  - src/app-shell/composition/infrastructure-module.js
---

# EmbedPermissionsResolver

Builds iframe permission policy strings for embed scenarios. Source: `proto-dev/src/host-integration/embedding/embed-permissions-resolver.js`.
