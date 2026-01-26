---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/drum.config.js
used_by:
  - src/application/services/DrumLayoutService.js
---

# Drum Configuration

Defines the default emoji layout used by the control-panel drum and exposes an overrides object that `DrumLayoutService` merges
with persisted user choices.[^1] `DEFAULT_DRUM_LAYOUT` is exported separately so services can fall back when overrides are empty
or malformed.[^2]

[^1]: Base layout and overrides [src/config/drum.config.js#L1-L12](../../src/config/drum.config.js#L1-L12)
[^2]: Shared default export [src/config/drum.config.js#L1-L6](../../src/config/drum.config.js#L1-L6)
