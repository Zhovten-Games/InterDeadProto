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
source: src/spirit-contacts/configuration/guide.js
used_by:
  - src/app-shell/composition/configuration-index.js
source_exists: true
runtime_role: guide
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Guide Spirit Configuration

Defines the tutorial ghost `guide` with three stages: intro dialog, camera quest (`find-person`), and outro with finale effect marker. Asset URLs are resolved through `resolveAssetUrl` for avatar and sounds.[^1]

The config keeps guide controls broadly available in messenger (`post`, `switch-ghost`, `reset-data`, scrolling) and gates camera usage by auth/AI readiness requirements.[^1]

[^1]: Full stage, quest, reactions, and messenger rule configuration [proto-dev/src/spirit-contacts/configuration/guide.js#L1-L84](../../../../../proto-dev/src/spirit-contacts/configuration/guide.js)
