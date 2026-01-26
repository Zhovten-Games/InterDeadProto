---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/events/EventObserver.js
used_by: []
---

# EventObserver

Abstract base for objects interested in game event lifecycles.[^1]  
Subclasses must implement `onStart` and `onComplete`, mirroring the hooks emitted by `Event`.[^2]

This contract enables decoupled observers to react to events without modifying the core logic.[^3]

[^1]: [src/core/events/EventObserver.js#L1-L4](../../../src/core/events/EventObserver.js#L1-L4)  
[^2]: [src/core/events/EventObserver.js#L5-L22](../../../src/core/events/EventObserver.js#L5-L22)  
[^3]: [src/core/events/Event.js#L19-L32](../../../src/core/events/Event.js#L19-L32)
