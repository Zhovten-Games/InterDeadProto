---
domains: []
emits:
  - CHAT_SCROLL_DOWN
  - CHAT_SCROLL_UP
implements: []
imports:
  - src/config/controls.config.js
  - src/config/templateBaseUrl.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - CAMERA_TOGGLE
  - DIALOG_AWAITING_INPUT_CHANGED
  - SCREEN_CHANGE
owns: []
schemaVersion: 1
source: src/presentation/widgets/ControlPanel/index.js
used_by: []
---

# ControlPanel

Manages the bottom control panel by loading the shared panel template and populating screen-specific sections with buttons from `controls.config.js`. The template URL is resolved via `TemplateBaseUrlResolver`, and the emoji drum is shown only when configured and the current screen is `messenger`, updating the `--chat-panel-height` CSS variable accordingly.[^1]

Scroll buttons emit `CHAT_SCROLL_UP/DOWN` via the event bus, while `DIALOG_AWAITING_INPUT_CHANGED` updates navigation highlights so the camera or messenger toggle flashes when user input is required on another screen.[^2]

[^1]: Template resolution, panel rendering, and drum visibility toggles [src/presentation/widgets/ControlPanel/index.js#L10-L100](../../../src/presentation/widgets/ControlPanel/index.js#L10-L100)
[^2]: Scroll controls, localization, and awaiting-input highlights [src/presentation/widgets/ControlPanel/index.js#L102-L129](../../../src/presentation/widgets/ControlPanel/index.js#L102-L129)
