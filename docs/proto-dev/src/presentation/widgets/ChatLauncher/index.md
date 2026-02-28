---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/presentation/widgets/ChatLauncher/index.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
  - src/application/services/ChatLauncherService.js
---

# ChatLauncherWidget

Renders the floating launcher button used in embedded mode. The widget injects a button with accessible text, applies localization, and exposes hooks to toggle visibility, enable/disable the button, and update its label key based on authentication state.[^1]

It also injects lightweight CSS rules for the launcher bubble and modal layout on first render, ensuring the button can be embedded without relying on global stylesheets.[^2]

[^1]: Rendering, event wiring, and label updates [src/presentation/widgets/ChatLauncher/index.js#L12-L74](../../../../src/presentation/widgets/ChatLauncher/index.js#L12-L74)
[^2]: Inline style injection for launcher UI [src/presentation/widgets/ChatLauncher/index.js#L76-L160](../../../../src/presentation/widgets/ChatLauncher/index.js#L76-L160)
