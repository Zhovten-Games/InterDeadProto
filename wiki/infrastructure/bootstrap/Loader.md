---
domains: []
emits:
  - OVERLAY_HIDE
  - OVERLAY_SHOW
  - OVERLAY_STEP
implements: []
imports:
  - src/config/loaderModules.config.js
  - src/infrastructure/bootstrap/Logger.js
listens:
  - BOOT_COMPLETE
  - BOOT_STEP
  - handler
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/Loader.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# Loader

The loader coordinates the startup overlay while enforcing single-tab execution for the app. Its constructor wires a `BroadcastChannel`, `storage` listeners, and an injected event bus (fallbacking to an internal no-op implementation) so every tab reacts consistently to `appLoading` and `activeTab` updates, emitting overlay events instead of touching the DOM directly.[^1]

`load` refuses to start when another active tab or fresh loading state is detected, refreshes the heartbeat, and announces progress via `OVERLAY_SHOW`, `OVERLAY_STEP`, and `OVERLAY_HIDE` events that presenters consume.[^2] Boot step names are translated through `loaderModules.config` so the overlay receives localized messages.[^3]

Helper methods persist timestamps for `activeTab`/`appLoading`, clear stale values, and handle storage broadcasts to keep tabs in sync, including parsing legacy string payloads.[^4]

[^1]: Constructor wiring of broadcast channel, storage listeners, bus fallback, and overlay emissions [src/infrastructure/bootstrap/Loader.js#L1-L57](../../../src/infrastructure/bootstrap/Loader.js#L1-L57)
[^2]: Guarded boot flow, heartbeat setup, and overlay lifecycle events [src/infrastructure/bootstrap/Loader.js#L60-L99](../../../src/infrastructure/bootstrap/Loader.js#L60-L99)
[^3]: Mapping boot step names to i18n keys [src/infrastructure/bootstrap/Loader.js#L78-L83](../../../src/infrastructure/bootstrap/Loader.js#L78-L83); [src/config/loaderModules.config.js#L1-L7](../../../src/config/loaderModules.config.js#L1-L7)
[^4]: State helpers for persistence freshness and storage reconciliation [src/infrastructure/bootstrap/Loader.js#L102-L170](../../../src/infrastructure/bootstrap/Loader.js#L102-L170)
