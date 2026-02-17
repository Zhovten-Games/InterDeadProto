---
domains: []
emits:
  - AI_STATE_CHANGED
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/config/assetsBaseUrl.js
  - src/config/cacheBuildId.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/ports/IDetection.js
  - src/utils/loadScript.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/ai/DetectionAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# DetectionAdapter

Loads the TensorFlow runtime and COCO-SSD model on demand, guarding boot calls with shared promises and a warmup step that can be disabled via configuration. The adapter tracks AI lifecycle phases (`LOADING_RUNTIME`, `LOADING_MODEL`, `WARMUP`, `READY`, `FAILED`) and emits `AI_STATE_CHANGED` so UI layers can react to model readiness or failure states.[^1]

`loadAssets` and `loadModel` append the cache build query parameter to runtime scripts and model URLs, including a fallback CDN URL when configured. The adapter also wraps `window.fetch` once to inject the build parameter for subsequent AI asset requests.[^2]

`detectTarget` serializes inference with a mutex, ensures the model is ready, and returns bounding box plus segmentation masks (polygon or image data). When a target is first detected, it updates presence in the state service and emits `BUTTON_STATE_UPDATED` to refresh control panels.[^3]

[^1]: AI state tracking, boot sequence, and warmup flow [src/adapters/ai/DetectionAdapter.js#L9-L152](../../../src/adapters/ai/DetectionAdapter.js#L9-L152)
[^2]: Cache build parameter usage and fetch wrapper for AI assets [src/adapters/ai/DetectionAdapter.js#L38-L80](../../../src/adapters/ai/DetectionAdapter.js#L38-L80); [src/adapters/ai/DetectionAdapter.js#L239-L269](../../../src/adapters/ai/DetectionAdapter.js#L239-L269)
[^3]: Detection logic, presence update, and mask construction [src/adapters/ai/DetectionAdapter.js#L154-L210](../../../src/adapters/ai/DetectionAdapter.js#L154-L210)
