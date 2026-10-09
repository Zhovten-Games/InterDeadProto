---
domains: []
emits: []
implements: []
imports:
  - src/asset-delivery/paths/assets-base-url.js
  - src/media/audio/sound-config.js
listens: []
owns: []
schemaVersion: 1
source: src/spirit-contacts/configuration/guest1.js
used_by:
  - src/app-shell/composition/configuration-index.js
source_exists: true
runtime_role: guest1
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Guest1 Spirit Configuration

Defines the `guest1` spirit, including avatar assets, reaction presets, sound effects, and a staged dialog/quest sequence. The flow pairs ghost prompts with auto‑generated user replies, camera quests for room objects, and a finale that includes a YouTube message and reaction‑finale marker.[^1]

Text animation overrides slow the initial typewriter effect and speed up replay runs for this spirit. Unlock metadata requires the `guide` spirit and keeps the guest visible, while messenger rules keep core actions (posting, switching, camera toggles, reset, scroll) enabled once unlocked.[^2]

[^1]: Avatar, reactions, stages, quests, and effects [src/spirit-contacts/configuration/guest1.js#L1-L114](../../../../../proto-dev/src/spirit-contacts/configuration/guest1.js)

[^2]: Animation, unlock conditions, and messenger rules [src/spirit-contacts/configuration/guest1.js#L116-L128](../../../../../proto-dev/src/spirit-contacts/configuration/guest1.js)
