---
title: LoginPrefillService
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - authLoginResolver
  - embeddingResolver
  - logger
  - persistence
  - profileRegistrationService
schemaVersion: 1
source: src/identity/authentication/login-prefill-service.js
source_exists: true
runtime_role: LoginPrefillService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
used_by:
  - src/app-shell/composition/application-module.js
---

# LoginPrefillService

Prefills login fields from persisted profile context before dialog start. Source: `proto-dev/src/identity/authentication/login-prefill-service.js`.
