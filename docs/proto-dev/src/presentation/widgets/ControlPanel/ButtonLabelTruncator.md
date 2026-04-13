---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/ControlPanel/ButtonLabelTruncator.js
used_by:
  - src/adapters/ui/PanelAdapter.js
source_exists: true
runtime_role: ui_widget
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: 'executive coordination hub'
---

# ButtonLabelTruncator

Utility component that trims overflowing control button labels and appends a trailing `.`.

## Why

Localized labels can be longer than available control width. This helper keeps the panel readable without breaking layout.

## Behavior

1. Reads localized label text after language application.
2. Detects visual overflow (`scrollWidth > clientWidth`).
3. Shortens the text one character at a time and appends a trailing dot until it fits.
4. Stores the full localized value in data attributes for re-application on language change.
