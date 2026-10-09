---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - container
schemaVersion: 1
source: src/camera/presentation/camera-widget.js
used_by:
  - src/camera/presentation/camera-status-widget.js
source_exists: true
runtime_role: CameraWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# CameraWidget

Provides a base class that renders the markup for camera interaction, including video view, detection indicators, and retry control[^1].
`CameraStatusWidget` extends this class to add event-driven status updates[^2].

[^1]: Markup assembly in [CameraWidget.js](/src/camera/presentation/camera-widget.js).

[^2]: Inheritance and additional logic in [CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js).
