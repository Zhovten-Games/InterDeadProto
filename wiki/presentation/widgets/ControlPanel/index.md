---
domains: []
emits:
  - CHAT_SCROLL_DOWN
  - CHAT_SCROLL_UP
implements: []
imports:
  - src/config/controls.config.js
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

Manages the bottom control panel by loading a shared template and populating screen-specific sections with buttons from `controls.config.js`. It listens for `SCREEN_CHANGE` via an injected event bus (`NullEventBus` fallback) to re-render the panel, toggling the emoji drum and adjusting root CSS variables depending on whether the messenger is active; the default configuration keeps the drum hidden unless enabled.[^1][^2][^4]

`DIALOG_AWAITING_INPUT_CHANGED` updates camera/messenger highlight states, while scroll buttons delegate to `ChatScrollWidget` by emitting `CHAT_SCROLL_UP/DOWN`. Each render binds localized buttons via `ButtonService` and reapplies language translations.[^3]

[^1]: Template loading, screen updates, and drum visibility [src/presentation/widgets/ControlPanel/index.js#L20-L84](../../../src/presentation/widgets/ControlPanel/index.js#L20-L84)
[^2]: `NullEventBus` fallback [src/presentation/widgets/ControlPanel/index.js#L1-L35](../../../src/presentation/widgets/ControlPanel/index.js#L1-L35); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Scroll bindings, localization, and awaiting-input highlights [src/presentation/widgets/ControlPanel/index.js#L85-L123](../../../src/presentation/widgets/ControlPanel/index.js#L85-L123)
[^4]: Default config hides the drum [src/config/default.config.js#L13-L19](../../../src/config/default.config.js#L13-L19)
