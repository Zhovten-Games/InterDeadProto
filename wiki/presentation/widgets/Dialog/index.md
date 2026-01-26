---
domains: []
emits:
  - CHAT_LOAD_OLDER
  - MEDIA_OPEN
  - REACTION_FINALE_RECALCULATE_REQUESTED
  - REACTION_OVERLAY_REQUESTED
  - log
implements: []
imports:
  - src/config/index.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/presentation/components/dialog/animations/TextAnimationManager.js
  - src/presentation/widgets/Dialog/MessageDeduplicator.js
listens:
  - CHAT_LOAD_OLDER
  - DIALOG_CLEAR
  - EVENT_MESSAGE_READY
  - REACTION_FINALE_STATE_UPDATED
  - REACTION_REMINDER_READY
  - REACTION_SELECTED
owns: []
schemaVersion: 1
source: src/presentation/widgets/Dialog/index.js
used_by:
  - src/presentation/adapters/GlobalViewPresenter.js
---

# DialogWidget

Renders chat messages reactively from injected event bus events (defaulting to `NullEventBus`) and maintains an ordered history with deduplication via [MessageDeduplicator](./MessageDeduplicator.md). Rendering is serialized through a `_renderLock` promise and only new messages are appended thanks to `lastRenderedIndex`, avoiding duplicate work while logging each render for traceability.[^1][^2] Message windows now follow `chatDisplay` configuration: the default "all" mode renders the entire history and hides scroll arrows on the control panel, while the optional "batch" mode reuses the three-message pagination flow for scroll-backed archives.[^7]

Emoji reactions are integrated throughout the widget: `REACTION_REMINDER_READY` marks pending messages until they render, `REACTION_SELECTED` updates both in-memory data and DOM state, and reaction triggers emit `REACTION_OVERLAY_REQUESTED` for `ReactionOverlayWidget`, supporting revisions when allowed.[^2]

Narrative notes now render alongside dialog text. `_buildNoteBlock` chooses stacked or inline layouts, injects toggle buttons when multiple variants exist, and `_cycleNote` persists the selected index per message so revisits keep the same variant while localization keeps toggle labels translated.[^3]

`renderLatest` and `renderOlder` hydrate messages incrementally, attaching media click handlers that emit `MEDIA_OPEN` and reaction listeners that wire overlay events. Scroll listeners emit `CHAT_LOAD_OLDER` when the user reaches the top of the container so history services can prepend older messages.[^4] `renderOlder` increases `renderCount` by the configured batch size but exits early when `renderCount` already matches `messages.length`, meaning the UI arrow legitimately "does nothing" whenever only one batch is persisted for the current ghost.[^5]

[^1]: Construction, deduplication, batching, and logging [src/presentation/widgets/Dialog/index.js#L9-L213](../../../src/presentation/widgets/Dialog/index.js#L9-L213)
[^2]: `NullEventBus` fallback [src/presentation/widgets/Dialog/index.js#L1-L40](../../../src/presentation/widgets/Dialog/index.js#L1-L40); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Reaction reminder/selection handling and overlay emission [src/presentation/widgets/Dialog/index.js#L66-L118](../../../src/presentation/widgets/Dialog/index.js#L66-L118); overlay trigger binding [src/presentation/widgets/Dialog/index.js#L492-L507](../../../src/presentation/widgets/Dialog/index.js#L492-L507)
[^4]: Note layout, toggle rendering, and selection persistence [src/presentation/widgets/Dialog/index.js#L345-L457](../../../src/presentation/widgets/Dialog/index.js#L345-L457)
[^5]: Render helpers, media listeners, and scroll integration [src/presentation/widgets/Dialog/index.js#L130-L214](../../../src/presentation/widgets/Dialog/index.js#L130-L214)
[^6]: Early exit in `renderOlder` when no hidden messages remain [src/presentation/widgets/Dialog/index.js#L232-L275](../../../src/presentation/widgets/Dialog/index.js#L232-L275)
[^7]: Display mode resolution and panel scroll toggle [src/presentation/widgets/Dialog/index.js#L32-L205](../../../src/presentation/widgets/Dialog/index.js#L32-L205); [src/config/chat.config.js#L1-L10](../../../src/config/chat.config.js#L1-L10); [src/config/controls.config.js#L1-L52](../../../src/config/controls.config.js#L1-L52)
