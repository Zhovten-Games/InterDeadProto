---
domains: []
emits:
  - BUTTON_STATE_UPDATED
implements: []
imports:
  - src/core/events/NullEventBus.js
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

Loads the TensorFlow COCO‑SSD model and exposes a single `detectTarget` method for object recognition. Asset scripts are fetched on demand and the model is initialized from local files[^1]. During detection the adapter guards against concurrent runs, updates optional state services, and emits `BUTTON_STATE_UPDATED` events through the injected event bus when a target is first observed[^2][^3]. A `NullEventBus` default keeps the adapter test friendly when no bus is supplied[^4].

[^1]: [`DetectionAdapter.js`](../../../src/adapters/ai/DetectionAdapter.js#L1-L34)
[^2]: [`DetectionAdapter.js`](../../../src/adapters/ai/DetectionAdapter.js#L36-L80)
[^3]: [`DetectionAdapter.js`](../../../src/adapters/ai/DetectionAdapter.js#L50-L58)
[^4]: [`DetectionAdapter.js`](../../../src/adapters/ai/DetectionAdapter.js#L4-L13); [`NullEventBus.js`](../../../src/core/events/NullEventBus.js#L1-L11)

