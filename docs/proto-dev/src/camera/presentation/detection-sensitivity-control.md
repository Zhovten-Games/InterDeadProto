---
title: DetectionSensitivityControl
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _inputListener
  - options
  - root
schemaVersion: 1
source: src/camera/presentation/detection-sensitivity-control.js
source_exists: true
runtime_role: DetectionSensitivityControl
contour_primary: INS-BODY
contour_secondary: SAL-SWITCH
role_group: body_regulation
narrative_role: embodied feedback channel
used_by:
  - src/camera/presentation/camera-status-widget.js
---

# DetectionSensitivityControl

UI control for adjusting camera/object-detection sensitivity. Source: `proto-dev/src/camera/presentation/detection-sensitivity-control.js`.
