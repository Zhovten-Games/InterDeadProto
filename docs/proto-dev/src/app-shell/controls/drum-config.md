---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/controls/drum-config.js
used_by:
  - src/app-shell/controls/drum-layout-service.js
source_exists: true
runtime_role: DEFAULT_DRUM_LAYOUT
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Drum Configuration

Defines the default emoji layout used by the control-panel drum and exposes an overrides object that `DrumLayoutService` merges
with persisted user choices.[^1] `DEFAULT_DRUM_LAYOUT` is exported separately so services can fall back when overrides are empty
or malformed.[^2]

[^1]: Base layout and overrides [src/app-shell/controls/drum-config.js#L1-L12](../../../../../proto-dev/src/app-shell/controls/drum-config.js)

[^2]: Shared default export [src/app-shell/controls/drum-config.js#L1-L6](../../../../../proto-dev/src/app-shell/controls/drum-config.js)
