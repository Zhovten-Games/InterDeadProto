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
  - AI_LOADER_VISIBILITY_CHANGED
  - AI_STATE_CHANGED
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

Coordinates rendering of the bottom control panel, wiring button definitions per screen and keeping the emoji drum in sync with runtime state. An injected event bus (defaulting to `NullEventBus`) responds to button updates, AI loader state changes, quest status, drum layout updates, and ghost unlock events to refresh the panel and highlight newly available spirits.[^1]

`load` renders `panel.html`, caches the container, reapplies drum layout and language, and remounts panel effects. `update` toggles drum visibility by screen, hydrates button sections, rebinds localization, rebuilds the ghost switcher options, and applies visibility/enablement rules from `ButtonStateService` and `ButtonVisibilityService`.[^2]

Ghost switching now guards against leaving the `guide` spirit before completion by showing a modal confirmation and emits `GHOST_CHANGE` on acceptance. The adapter also injects AI camera status into the camera button, including badge text and localized tooltips based on AI readiness.[^3]

[^1]: Event subscriptions for AI, button, quest, drum, and ghost updates [src/adapters/ui/PanelAdapter.js#L58-L109](../../../src/adapters/ui/PanelAdapter.js#L58-L109)
[^2]: Template rendering, screen hydration, ghost selector rebuild, and button toggles [src/adapters/ui/PanelAdapter.js#L112-L230](../../../src/adapters/ui/PanelAdapter.js#L112-L230)
[^3]: Guide-exit confirmation modal and AI camera badge handling [src/adapters/ui/PanelAdapter.js#L232-L346](../../../src/adapters/ui/PanelAdapter.js#L232-L346)
