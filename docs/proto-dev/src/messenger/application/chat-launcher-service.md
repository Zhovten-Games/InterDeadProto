---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _chooser
  - _iframe
  - _visibleUnsub
  - documentRef
  - embedPermissionsResolver
  - embeddingResolver
  - logger
  - modalAdapter
  - visibilityService
  - widget
schemaVersion: 1
source: src/messenger/application/chat-launcher-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ChatLauncherService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ChatLauncherService

Drives the floating launcher button and embedded app iframe when the embedding resolver reports `launcher` mode. On boot it renders the widget, wires the open callback, subscribes to visibility updates, and synchronizes button visibility and label text with authentication state.[^1]

Opening the launcher is blocked until authentication is ready. The service creates a modal iframe on first use, applying permissions from the embed permissions resolver and resolving the app source from `data-interdead-src` markers (with a fallback to `/InterDeadProto/index.html`).[^2]

[^1]: Boot flow, visibility updates, and launcher mode checks [src/messenger/application/chat-launcher-service.js#L22-L60](../../../../../proto-dev/src/messenger/application/chat-launcher-service.js)

[^2]: Auth gating, iframe creation, and source resolution [src/messenger/application/chat-launcher-service.js#L40-L82](../../../../../proto-dev/src/messenger/application/chat-launcher-service.js)
