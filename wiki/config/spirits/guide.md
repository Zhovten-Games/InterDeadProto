---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/spirits/guide.js
used_by: []
---

# Guide Spirit Configuration

Defines the tutorial `guide` ghost with staged reactions, quests, and introductory overlay metadata. Stage effects include `electricBorder` overrides to accelerate the control panel border during the opening quest before restoring defaults later.[^1]

The guide has no unlock requirements and keeps key panel actions (posting, switching ghosts, toggling camera, scrolling, reset) enabled so players can experiment during onboarding.[^2] A `textAnimation` block mirrors the guest presets, picking `fx1` for first-run copy and `fx3` for replays to keep dialog timing consistent.[^3]

[^1]: Reactions, stages, quest overlay, and effect overrides [src/config/spirits/guide.js#L1-L63](../../../src/config/spirits/guide.js#L1-L63)
[^2]: Messenger rules [src/config/spirits/guide.js#L74-L83](../../../src/config/spirits/guide.js#L74-L83)
[^3]: Text animation configuration [src/config/spirits/guide.js#L64-L73](../../../src/config/spirits/guide.js#L64-L73)
