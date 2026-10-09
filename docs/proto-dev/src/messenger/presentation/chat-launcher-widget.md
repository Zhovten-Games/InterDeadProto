---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _labelKey
  - _openHandler
  - button
  - documentRef
  - language
  - logger
  - root
schemaVersion: 1
source: src/messenger/presentation/chat-launcher-widget.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: ChatLauncherWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# ChatLauncherWidget

Renders the floating launcher button used in embedded mode. The widget injects a button with accessible text, applies localization, and exposes hooks to toggle visibility, enable/disable the button, and update its label key based on authentication state.[^1]

It also injects lightweight CSS rules for the launcher bubble and modal layout on first render, ensuring the button can be embedded without relying on global stylesheets.[^2]

[^1]: Rendering, event wiring, and label updates [src/messenger/presentation/chat-launcher-widget.js#L12-L74](../../../../../proto-dev/src/messenger/presentation/chat-launcher-widget.js)

[^2]: Inline style injection for launcher UI [src/messenger/presentation/chat-launcher-widget.js#L76-L160](../../../../../proto-dev/src/messenger/presentation/chat-launcher-widget.js)
