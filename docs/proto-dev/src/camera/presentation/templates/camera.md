---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/camera/presentation/templates/camera.html
used_by: []
source_exists: true
runtime_role: camera
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Camera Screen Template

Wraps the camera widget within a `camera-screen` container, enabling live video and detection feedback[^1].
`CameraStatusWidget` mounts into the `[data-js="camera-widget"]` node supplied here[^2].

[^1]: Structure in [camera.html](/src/camera/presentation/templates/camera.html).

[^2]: Camera widget integration in [CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js).
