---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ChatLauncherService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
  - src/infrastructure/bootstrap/LauncherBootstrapper.js
---

# ChatLauncherService

Drives the floating launcher button and embedded app iframe when the embedding resolver reports `launcher` mode. On boot it renders the widget, wires the open callback, subscribes to visibility updates, and synchronizes button visibility and label text with authentication state.[^1]

Opening the launcher is blocked until authentication is ready. The service creates a modal iframe on first use, applying permissions from the embed permissions resolver and resolving the app source from `data-interdead-src` markers (with a fallback to `/InterDeadProto/index.html`).[^2]

[^1]: Boot flow, visibility updates, and launcher mode checks [src/application/services/ChatLauncherService.js#L22-L60](../../../src/application/services/ChatLauncherService.js#L22-L60)
[^2]: Auth gating, iframe creation, and source resolution [src/application/services/ChatLauncherService.js#L40-L82](../../../src/application/services/ChatLauncherService.js#L40-L82)
