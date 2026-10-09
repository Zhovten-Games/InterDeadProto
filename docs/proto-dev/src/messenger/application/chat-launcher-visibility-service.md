---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _listeners
  - _unsubscribeAuth
  - authVisibilityAdapter
  - config
  - logger
schemaVersion: 1
source: src/messenger/application/chat-launcher-visibility-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ChatLauncherVisibilityService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ChatLauncherVisibilityService

Encapsulates launcher visibility and authentication rules based on configuration and the auth visibility adapter. It boots the adapter, emits status changes to listeners, and reports whether the launcher should be visible or enabled depending on the configured mode (`auth-gated`, `hidden-until-auth`, or `always`).[^1]

Consumers can subscribe to status updates via `onChange` and query `getStatus` to drive launcher UI state without depending on auth adapter internals.[^2]

[^1]: Boot flow, visibility rules, and authentication checks [src/messenger/application/chat-launcher-visibility-service.js#L10-L39](../../../../../proto-dev/src/messenger/application/chat-launcher-visibility-service.js)

[^2]: Status emission and listener management [src/messenger/application/chat-launcher-visibility-service.js#L41-L61](../../../../../proto-dev/src/messenger/application/chat-launcher-visibility-service.js)
