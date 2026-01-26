---
domains: []
emits:
  - GHOST_CHANGE
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/ports/IPanel.js
listens:
  - BUTTON_STATE_UPDATED
  - BUTTON_VISIBILITY_UPDATED
  - DRUM_LAYOUT_UPDATED
  - GHOST_CHANGE
  - GHOST_UNLOCKED
  - QUEST_COMPLETED
  - QUEST_STARTED
owns: []
schemaVersion: 1
source: src/adapters/ui/PanelAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# PanelAdapter

Coordinates rendering of the bottom control panel, wiring button definitions per screen, and keeping the emoji drum in sync with runtime state.[^1] An injected event bus (defaulting to `NullEventBus`) fans in button updates, ghost switches, quest status, drum layout changes, and `GHOST_UNLOCKED` events so the adapter can repaint the selector while highlighting new spirits.[^2][^5]

`load` renders `panel.html`, caches the container, reapplies the drum layout, re-mounts the electric border widget, and reapplies localization every time the markup is replaced.[^3] `update` toggles drum visibility by screen, updates the `--chat-panel-height` root variable, hydrates configured button sections, rebinds localization, and mirrors button enable/visibility rules supplied by `ButtonStateService`/`ButtonVisibilityService`; the ghost switcher is rebuilt with the latest unlocked list and disables when only one spirit is available.[^4]

[^1]: Template setup and dependency wiring [src/adapters/ui/PanelAdapter.js#L1-L49](../../../src/adapters/ui/PanelAdapter.js#L1-L49)
[^2]: Event subscriptions covering button state, drum layout, quests, and ghost unlock highlights [src/adapters/ui/PanelAdapter.js#L51-L99](../../../src/adapters/ui/PanelAdapter.js#L51-L99)
[^3]: Template rendering, effect mounting, and localization [src/adapters/ui/PanelAdapter.js#L100-L121](../../../src/adapters/ui/PanelAdapter.js#L100-L121)
[^4]: Screen-specific hydration, CSS variable updates, localization, ghost dropdown rebuild, and button toggles [src/adapters/ui/PanelAdapter.js#L124-L226](../../../src/adapters/ui/PanelAdapter.js#L124-L226)
[^5]: `NullEventBus` fallback [src/adapters/ui/PanelAdapter.js#L1-L48](../../../src/adapters/ui/PanelAdapter.js#L1-L48); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
