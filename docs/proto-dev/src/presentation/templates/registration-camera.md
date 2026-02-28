---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/templates/registration-camera.html
used_by: []
---

# Registration Camera Template

Hosts the selfie capture interface and delegates rendering to a camera widget placeholder.
`CameraStatusWidget` mounts into this placeholder to provide live capture and status updates[^2].

[^1]: Template markup in [registration-camera.html](/src/presentation/templates/registration-camera.html#L1-L4).
[^2]: `CameraStatusWidget` uses the `[data-js="camera-widget"]` node defined here ([CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L16-L37)).
