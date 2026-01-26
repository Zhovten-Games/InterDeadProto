---
domains: []
emits:
  - DRUM_LAYOUT_UPDATED
implements: []
imports:
  - src/config/drum.config.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/DrumLayoutService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DrumLayoutService

Provides emoji drum layouts and broadcasts updates when overrides change. On boot it pulls persisted overrides—supporting legacy
per-ghost formats—and normalizes them into a global list before any UI renders while routing notifications through an injected
event bus (`NullEventBus` fallback).[^1][^2] `getLayout()` merges overrides with the configured defaults so missing slots fall
back gracefully, while `getLayoutForGhost()` is retained for compatibility with older callers.[^3]

`setOverride()` stores a normalized layout and emits `DRUM_LAYOUT_UPDATED` so listeners like `PanelAdapter` can repaint the drum
immediately. `notifyLayoutChange()` centralizes the emission for manual refreshes.[^4]

[^1]: Persistence-aware initialization and legacy support [src/application/services/DrumLayoutService.js#L1-L33](../../src/application/services/DrumLayoutService.js#L1-L33)
[^2]: Event bus injection and `NullEventBus` default [src/application/services/DrumLayoutService.js#L1-L15](../../src/application/services/DrumLayoutService.js#L1-L15); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Layout retrieval helpers [src/application/services/DrumLayoutService.js#L35-L54](../../src/application/services/DrumLayoutService.js#L35-L54); base layout fallback [src/application/services/DrumLayoutService.js#L74-L79](../../src/application/services/DrumLayoutService.js#L74-L79)
[^4]: Override persistence and update emission [src/application/services/DrumLayoutService.js#L55-L72](../../src/application/services/DrumLayoutService.js#L55-L72)
