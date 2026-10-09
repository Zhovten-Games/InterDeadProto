---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/asset-delivery/browser/load-script.js
used_by: []
source_exists: true
runtime_role: loadScript
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# loadScript

`loadScript` injects a `<script>` element and resolves when the resource loads, enabling sequential loading of external libraries.[^1] The object detection adapter relies on it to fetch TensorFlow and COCO‑SSD before initializing the model.[^2]

[^1]: [src/asset-delivery/browser/load-script.js#L1-L10](../../../../../proto-dev/src/asset-delivery/browser/load-script.js)

[^2]: [src/camera/detection/detection-adapter.js#L1](../../../../../proto-dev/src/camera/detection/detection-adapter.js) and [src/camera/detection/detection-adapter.js#L18-L21](../../../../../proto-dev/src/camera/detection/detection-adapter.js)
