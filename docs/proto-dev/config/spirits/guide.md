---
domains: []
emits: []
implements: []
imports:
  - proto-dev/src/config/assetsBaseUrl.js
listens: []
owns: []
schemaVersion: 1
source: proto-dev/src/config/spirits/guide.js
used_by:
  - proto-dev/src/application/services/DialogOrchestratorService.js
---

# Guide Spirit Configuration

Defines the tutorial ghost `guide` with three stages: intro dialog, camera quest (`find-person`), and outro with finale effect marker. Asset URLs are resolved through `resolveAssetUrl` for avatar and sounds.[^1]

The config keeps guide controls broadly available in messenger (`post`, `switch-ghost`, `reset-data`, scrolling) and gates camera usage by auth/AI readiness requirements.[^1]

[^1]: Full stage, quest, reactions, and messenger rule configuration [proto-dev/src/config/spirits/guide.js#L1-L84](../../../../proto-dev/src/config/spirits/guide.js#L1-L84)
