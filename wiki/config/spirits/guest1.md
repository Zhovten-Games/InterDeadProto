---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/spirits/guest1.js
used_by: []
---

# Guest1 Spirit Configuration

Describes the `guest1` ghost: avatar, staged chat/quest flow, and stage-level reaction map that pairs dialogue with camera quests to unlock rewards. Stage metadata includes `effects.electricBorder` overrides so the panel border can speed up during the first quest before reverting to defaults later.[^1]

The spirit unlocks only after the `guide` ghost and exposes messenger rules that always allow posting, ghost switching, camera toggles, resets, and scrolling—`PanelAdapter` and button services read these to wire controls per ghost.[^2] A `textAnimation` block selects the typewriter effect presets (`fx1` for first-run, `fx3` for replays) so `DialogWidget` animates guest copy consistently.[^3]

[^1]: Stage events, quests, reactions, and effect overrides [src/config/spirits/guest1.js#L1-L73](../../../src/config/spirits/guest1.js#L1-L73)
[^2]: Unlock requirements and messenger rules [src/config/spirits/guest1.js#L82-L92](../../../src/config/spirits/guest1.js#L82-L92)
[^3]: Text animation configuration [src/config/spirits/guest1.js#L74-L81](../../../src/config/spirits/guest1.js#L74-L81)
