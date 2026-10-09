---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - loadModel
  - logger
  - retryDelaysMs
  - sleep
schemaVersion: 1
source: src/camera/detection/model-load-strategy.js
used_by: []
source_exists: true
runtime_role: ModelLoadStrategy
contour_primary: PREDICT-LOOP
contour_secondary: none
role_group: memory_narrative
narrative_role: model fallback predictor
---

# ModelLoadStrategy

`ModelLoadStrategy` encapsulates COCO-SSD loading retries for the primary model URL and performs a fallback switch only after the retry window is exhausted.[^1]

Default retry delays are `250ms`, `750ms`, and `1500ms` (four attempts total including the first call). The strategy logs every failed primary attempt and waits between retries using injected `sleep` for testability.[^1]

If primary loading still fails and fallback URL differs from primary URL, it logs fallback activation and returns the fallback model result. Otherwise it rethrows the final primary error.[^2]

[^1]: Constructor defaults, retry schedule, and `_loadPrimary` attempt loop [src/camera/detection/model-load-strategy.js#L1-L50](../../../../../proto-dev/src/camera/detection/model-load-strategy.js)

[^2]: Fallback branch and final error behavior [src/camera/detection/model-load-strategy.js#L14-L32](../../../../../proto-dev/src/camera/detection/model-load-strategy.js)
