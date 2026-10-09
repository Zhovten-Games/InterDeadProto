---
domains: []
emits:
  - log
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - MEDIA_OPEN
owns:
  - _handler
  - bus
  - mediaRepository
  - modalService
schemaVersion: 1
source: src/media/presentation/media-lightbox.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: MediaLightbox
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# MediaLightbox

Presents images in a modal overlay when a `MEDIA_OPEN` event occurs.
It subscribes to the injected event bus (falling back to `NullEventBus`) at boot and retrieves image URLs from the media repository to display them in a dynamically created DOM node[^1][^2].
When disposed it unsubscribes and revokes object URLs to free resources[^2].
The widget is triggered by `DialogWidget`, which emits `MEDIA_OPEN` when a chat image is clicked[^3].

[^1]: Subscribes and handles `MEDIA_OPEN` events in [MediaLightbox.js](/src/media/presentation/media-lightbox.js).

[^2]: `NullEventBus` fallback [MediaLightbox.js](/src/media/presentation/media-lightbox.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Cleanup in [MediaLightbox.js](/src/media/presentation/media-lightbox.js).

[^4]: `DialogWidget` emits `MEDIA_OPEN` on image click ([Dialog/index.js](/src/messenger/presentation/dialog-widget.js)).
