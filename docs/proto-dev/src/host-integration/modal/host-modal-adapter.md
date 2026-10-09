---
title: HostModalAdapter
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _internal
  - documentRef
  - logger
  - windowRef
schemaVersion: 1
source: src/host-integration/modal/host-modal-adapter.js
source_exists: true
runtime_role: HostModalAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
used_by:
  - src/app-shell/composition/infrastructure-module.js
---

# HostModalAdapter

Adapter that opens/closes host-side modal containers for embedded runtime mode. Source: `proto-dev/src/host-integration/modal/host-modal-adapter.js`.
