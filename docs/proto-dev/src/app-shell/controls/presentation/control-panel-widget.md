---
domains: []
emits:
  - CHAT_SCROLL_DOWN
  - CHAT_SCROLL_UP
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/app-shell/controls/controls-config.js
  - src/asset-delivery/paths/template-base-url.js
listens:
  - CAMERA_TOGGLE
  - DIALOG_AWAITING_INPUT_CHANGED
  - SCREEN_CHANGE
owns:
  - _awaiting
  - _handler
  - _panel
  - _scrollDownBtn
  - _scrollDownHandler
  - _scrollUpBtn
  - _scrollUpHandler
  - _template
  - bus
  - buttonService
  - controls
  - currentScreen
  - languageService
  - screenMap
  - selector
  - showEmojiDrum
  - templateUrl
schemaVersion: 1
source: src/app-shell/controls/presentation/control-panel-widget.js
used_by: []
source_exists: true
runtime_role: ControlPanel
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# ControlPanel

Manages the bottom control panel by loading the shared panel template and populating screen-specific sections with buttons from `controls.config.js`. The template URL is resolved via `TemplateBaseUrlResolver`, and the emoji drum is shown only when configured and the current screen is `messenger`, updating the `--chat-panel-height` CSS variable accordingly.[^1]

Scroll buttons emit `CHAT_SCROLL_UP/DOWN` via the event bus, while `DIALOG_AWAITING_INPUT_CHANGED` updates navigation highlights so the camera or messenger toggle flashes when user input is required on another screen.[^2]

[^1]: Template resolution, panel rendering, and drum visibility toggles [src/app-shell/controls/presentation/control-panel-widget.js#L10-L100](../../../../../../proto-dev/src/app-shell/controls/presentation/control-panel-widget.js)

[^2]: Scroll controls, localization, and awaiting-input highlights [src/app-shell/controls/presentation/control-panel-widget.js#L102-L129](../../../../../../proto-dev/src/app-shell/controls/presentation/control-panel-widget.js)
