---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IView.js
used_by:
  - src/adapters/ui/ViewAdapter.js
---

# IView Port

Defines the minimal contract for visual components capable of rendering and reacting to application events.[^1] Views typically render templates and subscribe to the event bus for updates.[^3]

## Relations
- Import test guarantees the module loads.[^2]
- Works with `IEventBus` to receive state changes.[^3]
- Honors repository port naming conventions.[^4]

[^1]: [src/ports/IView.js](../../src/ports/IView.js#L1)
[^2]: [tests/ports/testIView.test.js](../../tests/ports/testIView.test.js#L3-L14)
[^3]: [src/ports/IEventBus.js](../../src/ports/IEventBus.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
