---
domains: []
emits: []
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - MEDIA_OPEN
owns: []
schemaVersion: 1
source: src/presentation/components/MediaLightbox.js
used_by: []
---

# MediaLightbox

Presents images in a modal overlay when a `MEDIA_OPEN` event occurs.
It subscribes to the injected event bus (falling back to `NullEventBus`) at boot and retrieves image URLs from the media repository to display them in a dynamically created DOM node[^1][^2].
When disposed it unsubscribes and revokes object URLs to free resources[^2].
The widget is triggered by `DialogWidget`, which emits `MEDIA_OPEN` when a chat image is clicked[^3].

[^1]: Subscribes and handles `MEDIA_OPEN` events in [MediaLightbox.js](/src/presentation/components/MediaLightbox.js#L1-L36).
[^2]: `NullEventBus` fallback [MediaLightbox.js](/src/presentation/components/MediaLightbox.js#L1-L12); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Cleanup in [MediaLightbox.js](/src/presentation/components/MediaLightbox.js#L38-L44).
[^4]: `DialogWidget` emits `MEDIA_OPEN` on image click ([Dialog/index.js](/src/presentation/widgets/Dialog/index.js#L197-L203)).
