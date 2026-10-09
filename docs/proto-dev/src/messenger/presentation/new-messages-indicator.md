---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _clickHandler
  - button
  - container
  - i18nKey
  - language
schemaVersion: 1
source: src/messenger/presentation/new-messages-indicator.js
used_by:
  - src/messenger/presentation/dialog-widget.js
source_exists: true
runtime_role: NewMessagesIndicator
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# NewMessagesIndicator

`NewMessagesIndicator` is a lightweight UI helper that owns the lifecycle of the "new messages" call-to-action button rendered above the bottom panel.[^1]

## Responsibilities

- Lazily creates a single button element inside a provided container (`ensure`).
- Localizes the button label through injected `languageService` methods (`translate` + `applyLanguage`) with fallback text.
- Manages click handler attachment/removal when shown/hidden.
- Removes the element and event handlers on `dispose` to prevent leaks.

## Why it exists

`DialogWidget` keeps message rendering logic focused by delegating CTA DOM behavior to a dedicated class instead of mixing rendering and control-surface lifecycle concerns in one module.[^2]

[^1]: Implementation details and lifecycle methods in [src/messenger/presentation/new-messages-indicator.js#L1-L74](../../../../../proto-dev/src/messenger/presentation/new-messages-indicator.js)

[^2]: Dialog widget integration in [src/messenger/presentation/dialog-widget.js#L1-L120](../../../../../proto-dev/src/messenger/presentation/dialog-widget.js)
