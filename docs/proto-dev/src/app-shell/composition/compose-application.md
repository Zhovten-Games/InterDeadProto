---
title: composeApplication
domains: []
emits: []
implements: []
imports:
  - src/app-shell/composition/container.js
  - src/app-shell/bootstrap/boot-manager.js
  - src/app-shell/composition/configuration-index.js
  - src/app-shell/composition/infrastructure-module.js
  - src/app-shell/composition/domain-module.js
  - src/app-shell/composition/application-module.js
  - src/app-shell/composition/presentation-module.js
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: composeApplication
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
used_by:
  - src/app-shell/bootstrap/application-bootstrap.js
---

# composeApplication

Composes application modules and returns the initialized runtime container. Source: `proto-dev/src/app-shell/composition/compose-application.js`.
