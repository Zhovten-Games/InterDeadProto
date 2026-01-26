---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/spirits/sample.json
used_by: []
---

# Sample Spirit JSON

`sample.json` demonstrates the JSON format expected by `DualityConfigService`, defining unlock behaviour, an avatar, and ordered stages with chat events and optional quests[^1]. `DualityConfigService` fetches such JSON files when loading spirit definitions[^2].

[^1]: [`sample.json`](../../../src/config/spirits/sample.json#L1-L13)
[^2]: [`DualityConfigService.js`](../../../src/application/services/DualityConfigService.js#L1-L21)
