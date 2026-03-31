---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/camera.html
used_by: []
source_exists: true
runtime_role: camera_template
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: "narrative context builder"
---

# Camera Screen Template

Wraps the camera widget within a `camera-screen` container, enabling live video and detection feedback[^1].
`CameraStatusWidget` mounts into the `[data-js="camera-widget"]` node supplied here[^2].

[^1]: Structure in [camera.html](/src/presentation/templates/camera.html#L1-L3).
[^2]: Camera widget integration in [CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L16-L37).
