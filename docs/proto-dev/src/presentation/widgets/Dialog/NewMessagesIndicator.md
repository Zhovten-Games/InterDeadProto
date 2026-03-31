---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/Dialog/NewMessagesIndicator.js
used_by: 
  - src/presentation/widgets/Dialog/index.js
source_exists: true
runtime_role: new_messages_indicator_widget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: "embodied feedback channel"
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

[^1]: Implementation details and lifecycle methods in [src/presentation/widgets/Dialog/NewMessagesIndicator.js#L1-L74](../../../../../proto-dev/src/presentation/widgets/Dialog/NewMessagesIndicator.js#L1-L74)

[^2]: Dialog widget integration in [src/presentation/widgets/Dialog/index.js#L1-L120](../../../../../proto-dev/src/presentation/widgets/Dialog/index.js#L1-L120)
