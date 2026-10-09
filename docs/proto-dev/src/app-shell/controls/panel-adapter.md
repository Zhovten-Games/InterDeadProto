---
domains: []
emits:
  - GHOST_CHANGE
implements:
  - IPanel
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/app-shell/ports/panel-port.js
  - src/app-shell/controls/presentation/button-label-truncator.js
listens:
  - AI_STATE_CHANGED
  - BUTTON_STATE_UPDATED
  - BUTTON_VISIBILITY_UPDATED
  - DRUM_LAYOUT_UPDATED
  - GHOST_CONTEXT_COMMITTED
  - GHOST_UNLOCKED
  - QUEST_COMPLETED
  - QUEST_STARTED
  - object
  - presence
owns:
  - _handler
  - _highlightTimer
  - _loadRevision
  - _updateRevision
  - buttonService
  - buttonStateService
  - buttonVisibilityService
  - containerSelector
  - controls
  - currentScreen
  - drumLayoutService
  - dualityManager
  - eventBus
  - ghostService
  - ghostSwitchService
  - labelTruncator
  - languageManager
  - modalService
  - panelContainer
  - profileRegService
  - screenMap
  - showEmojiDrum
  - spiritConfigs
  - stateService
  - templateService
schemaVersion: 1
source: src/app-shell/controls/panel-adapter.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: PanelAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# PanelAdapter

Coordinates rendering of the bottom control panel, wiring button definitions per screen and keeping the emoji drum in sync with runtime state. An injected event bus (defaulting to `NullEventBus`) responds to button updates, AI loader state changes, quest status, drum layout updates, and ghost unlock events to refresh the panel and highlight newly available spirits.[^1]

`load` renders `panel.html`, caches the container, reapplies drum layout and language, and remounts panel effects. `update` toggles drum visibility by screen, hydrates button sections, rebinds localization, rebuilds the ghost switcher options, and applies visibility/enablement rules from `ButtonStateService` and `ButtonVisibilityService`.[^2]

Ghost switching now guards against leaving the `guide` spirit before completion by showing a modal confirmation and emits `GHOST_CHANGE` on acceptance. The adapter also injects AI camera status into the camera button, including badge text and localized tooltips based on AI readiness.[^3]

[^1]: Event subscriptions for AI, button, quest, drum, and ghost updates [src/app-shell/controls/panel-adapter.js#L58-L109](../../../../../proto-dev/src/app-shell/controls/panel-adapter.js)

[^2]: Template rendering, screen hydration, ghost selector rebuild, and button toggles [src/app-shell/controls/panel-adapter.js#L112-L230](../../../../../proto-dev/src/app-shell/controls/panel-adapter.js)

[^3]: Guide-exit confirmation modal and AI camera badge handling [src/app-shell/controls/panel-adapter.js#L232-L346](../../../../../proto-dev/src/app-shell/controls/panel-adapter.js)
