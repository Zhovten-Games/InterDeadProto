---
domains: []
emits:
  - AI_STATE_CHANGED
  - BUTTON_STATE_UPDATED
implements:
  - src/ports/IDetection.js
imports:
  - src/adapters/ai/ModelLoadStrategy.js
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

`DetectionAdapter` lazily loads TensorFlow runtime scripts and the COCO-SSD model, then exposes a single `detectTarget` entrypoint with boot/warmup orchestration and AI state notifications.[^1]

The adapter emits `AI_STATE_CHANGED` for all lifecycle stages (`IDLE`, `LOADING_RUNTIME`, `LOADING_MODEL`, `WARMUP`, `READY`, `FAILED`) and keeps boot/model/runtime promises deduplicated to avoid duplicate concurrent initialization.[^1]

Model loading is delegated to `ModelLoadStrategy`, with automatic retry for the primary URL and fallback to CDN when configured.[^2]

For AI assets fetched through `window.fetch`, the adapter installs a one-time wrapper that appends the cache build parameter (`v=`) to AI URLs. When `fetch` receives a `Request` object, the wrapper now rewrites it to a string URL to avoid unstable `Request(nextUrl, request)` reconstruction paths.[^3]

`detectTarget` serializes inference with an internal mutex, updates presence state on first positive detection, and returns `box` + `mask` (segmentation polygon, image mask, or bbox fallback polygon).[^4]

[^1]: AI lifecycle, promise deduplication, boot, and warmup logic [src/adapters/ai/DetectionAdapter.js#L10-L157](../../../src/adapters/ai/DetectionAdapter.js#L10-L157)
[^2]: `loadModelWithFallback` integration with dedicated strategy [src/adapters/ai/DetectionAdapter.js#L219-L228](../../../src/adapters/ai/DetectionAdapter.js#L219-L228)
[^3]: Cache-build fetch wrapper, AI URL filtering, and `Request` URL resolution [src/adapters/ai/DetectionAdapter.js#L239-L269](../../../src/adapters/ai/DetectionAdapter.js#L239-L269)
[^4]: Detection flow, presence updates, and mask construction [src/adapters/ai/DetectionAdapter.js#L159-L217](../../../src/adapters/ai/DetectionAdapter.js#L159-L217)
