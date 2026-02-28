---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ChatLauncherVisibilityService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
  - src/application/services/ChatLauncherService.js
---

# ChatLauncherVisibilityService

Encapsulates launcher visibility and authentication rules based on configuration and the auth visibility adapter. It boots the adapter, emits status changes to listeners, and reports whether the launcher should be visible or enabled depending on the configured mode (`auth-gated`, `hidden-until-auth`, or `always`).[^1]

Consumers can subscribe to status updates via `onChange` and query `getStatus` to drive launcher UI state without depending on auth adapter internals.[^2]

[^1]: Boot flow, visibility rules, and authentication checks [src/application/services/ChatLauncherVisibilityService.js#L10-L39](../../../src/application/services/ChatLauncherVisibilityService.js#L10-L39)
[^2]: Status emission and listener management [src/application/services/ChatLauncherVisibilityService.js#L41-L61](../../../src/application/services/ChatLauncherVisibilityService.js#L41-L61)
