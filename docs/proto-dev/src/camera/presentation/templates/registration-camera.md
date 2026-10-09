---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/camera/presentation/templates/registration-camera.html
used_by: []
source_exists: true
runtime_role: registration-camera
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# Registration Camera Template

Hosts the selfie capture interface and delegates rendering to a camera widget placeholder.
`CameraStatusWidget` mounts into this placeholder to provide live capture and status updates[^2].

[^1]: Template markup in [registration-camera.html](/src/camera/presentation/templates/registration-camera.html).

[^2]: `CameraStatusWidget` uses the `[data-js="camera-widget"]` node defined here ([CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js)).
