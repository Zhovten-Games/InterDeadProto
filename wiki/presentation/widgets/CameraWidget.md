---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/CameraWidget.js
used_by:
  - src/presentation/widgets/CameraStatusWidget.js
---

# CameraWidget

Provides a base class that renders the markup for camera interaction, including video view, detection indicators, and retry control[^1].
`CameraStatusWidget` extends this class to add event-driven status updates[^2].

[^1]: Markup assembly in [CameraWidget.js](/src/presentation/widgets/CameraWidget.js#L1-L25).
[^2]: Inheritance and additional logic in [CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L1-L37).
