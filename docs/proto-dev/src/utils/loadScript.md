---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/utils/loadScript.js
used_by:
  - src/adapters/ai/DetectionAdapter.js
---

# loadScript

`loadScript` injects a `<script>` element and resolves when the resource loads, enabling sequential loading of external libraries.[^1] The object detection adapter relies on it to fetch TensorFlow and COCO‑SSD before initializing the model.[^2]

[^1]: [src/utils/loadScript.js#L1-L10](../../src/utils/loadScript.js#L1-L10)
[^2]: [src/adapters/ai/DetectionAdapter.js#L1](../../src/adapters/ai/DetectionAdapter.js#L1) and [src/adapters/ai/DetectionAdapter.js#L18-L21](../../src/adapters/ai/DetectionAdapter.js#L18-L21)
