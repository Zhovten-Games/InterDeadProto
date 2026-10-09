---
title: EmbeddingModeResolver
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _cached
  - documentRef
  - logger
schemaVersion: 1
source: src/host-integration/embedding/embedding-mode-resolver.js
source_exists: true
runtime_role: EmbeddingModeResolver
contour_primary: AUTH-GHOST
contour_secondary: none
role_group: anomaly_layer
narrative_role: identity anomaly mediator
used_by:
  - src/app-shell/composition/infrastructure-module.js
---

# EmbeddingModeResolver

Resolves runtime embedding mode (full app vs launcher/embed) from bootstrap inputs. Source: `proto-dev/src/host-integration/embedding/embedding-mode-resolver.js`.
