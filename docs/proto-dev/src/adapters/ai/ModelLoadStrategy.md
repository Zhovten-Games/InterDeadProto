---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ai/ModelLoadStrategy.js
used_by:
  - src/adapters/ai/DetectionAdapter.js
---

# ModelLoadStrategy

`ModelLoadStrategy` encapsulates COCO-SSD loading retries for the primary model URL and performs a fallback switch only after the retry window is exhausted.[^1]

Default retry delays are `250ms`, `750ms`, and `1500ms` (four attempts total including the first call). The strategy logs every failed primary attempt and waits between retries using injected `sleep` for testability.[^1]

If primary loading still fails and fallback URL differs from primary URL, it logs fallback activation and returns the fallback model result. Otherwise it rethrows the final primary error.[^2]

[^1]: Constructor defaults, retry schedule, and `_loadPrimary` attempt loop [src/adapters/ai/ModelLoadStrategy.js#L1-L50](../../../src/adapters/ai/ModelLoadStrategy.js#L1-L50)
[^2]: Fallback branch and final error behavior [src/adapters/ai/ModelLoadStrategy.js#L14-L32](../../../src/adapters/ai/ModelLoadStrategy.js#L14-L32)
