---
domains: []
emits: []
implements: []
imports:
  - src/asset-delivery/paths/assets-base-url.js
listens: []
owns: []
schemaVersion: 1
source: src/reactions/configuration/reaction-finale-config.js
used_by:
  - src/reactions/application/reaction-finale-service.js
source_exists: true
runtime_role: reaction-finale-config
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# reactionFinale.config

Defines per‑ghost finale presentation settings used by `ReactionFinaleService`. Each ghost entry declares the stages to exclude from finale tracking, a pending prompt (message + button), and a success payload containing localized title/message keys and optional image metadata.[^1]

The configuration resolves asset URLs through `resolveAssetUrl`, keeping image references consistent across build and runtime environments.[^1]

[^1]: Finale definitions and asset resolution [src/reactions/configuration/reaction-finale-config.js#L1-L30](../../../../../proto-dev/src/reactions/configuration/reaction-finale-config.js)
