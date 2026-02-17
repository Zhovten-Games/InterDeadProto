---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/loaderModules.config.js
used_by:
  - src/infrastructure/bootstrap/Loader.js
---

# Loader Modules Configuration

Maps service identifiers to localization keys used during application boot[^1]. The Loader reads this map when emitting `OVERLAY_STEP` events so the UI can display progress messages[^2].

[^1]: [`loaderModules.config.js`](../../src/config/loaderModules.config.js#L1-L7)
[^2]: [`Loader.js`](../../src/infrastructure/bootstrap/Loader.js#L75-L80)
