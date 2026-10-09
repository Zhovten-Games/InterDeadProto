---
domains: []
emits:
  - DRUM_LAYOUT_UPDATED
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/app-shell/controls/drum-config.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - booted
  - bus
  - config
  - overrideLayout
  - persistence
schemaVersion: 1
source: src/app-shell/controls/drum-layout-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DrumLayoutService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DrumLayoutService

Provides emoji drum layouts and broadcasts updates when overrides change. On boot it pulls persisted overrides—supporting legacy
per-ghost formats—and normalizes them into a global list before any UI renders while routing notifications through an injected
event bus (`NullEventBus` fallback).[^1][^2] `getLayout()` merges overrides with the configured defaults so missing slots fall
back gracefully, while `getLayoutForGhost()` is retained for compatibility with older callers.[^3]

`setOverride()` stores a normalized layout and emits `DRUM_LAYOUT_UPDATED` so listeners like `PanelAdapter` can repaint the drum
immediately. `notifyLayoutChange()` centralizes the emission for manual refreshes.[^4]

[^1]: Persistence-aware initialization and legacy support [src/app-shell/controls/drum-layout-service.js#L1-L33](../../../../../proto-dev/src/app-shell/controls/drum-layout-service.js)

[^2]: Event bus injection and `NullEventBus` default [src/app-shell/controls/drum-layout-service.js#L1-L15](../../../../../proto-dev/src/app-shell/controls/drum-layout-service.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Layout retrieval helpers [src/app-shell/controls/drum-layout-service.js#L35-L54](../../../../../proto-dev/src/app-shell/controls/drum-layout-service.js); base layout fallback [src/app-shell/controls/drum-layout-service.js#L74-L79](../../../../../proto-dev/src/app-shell/controls/drum-layout-service.js)

[^4]: Override persistence and update emission [src/app-shell/controls/drum-layout-service.js#L55-L72](../../../../../proto-dev/src/app-shell/controls/drum-layout-service.js)
