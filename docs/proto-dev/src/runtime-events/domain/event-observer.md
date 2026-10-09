---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-events/domain/event-observer.js
used_by: []
source_exists: true
runtime_role: EventObserver
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# EventObserver

Abstract base for objects interested in game event lifecycles.[^1]  
Subclasses must implement `onStart` and `onComplete`, mirroring the hooks emitted by `Event`.[^2]

This contract enables decoupled observers to react to events without modifying the core logic.[^3]

[^1]: [src/runtime-events/domain/event-observer.js#L1-L4](../../../../../proto-dev/src/runtime-events/domain/event-observer.js)

[^2]: [src/runtime-events/domain/event-observer.js#L5-L22](../../../../../proto-dev/src/runtime-events/domain/event-observer.js)

[^3]: [src/runtime-events/domain/event.js#L19-L32](../../../../../proto-dev/src/runtime-events/domain/event.js)
