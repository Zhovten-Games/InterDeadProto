---
domains: []
emits:
  - log
implements: []
imports:
  - src/presentation/components/dialog/animations/ShuffleRevealEffect.js
  - src/presentation/components/dialog/animations/TypewriterCascadeEffect.js
  - src/utils/emojiProtocol.js
listens: []
owns: []
schemaVersion: 1
source: src/presentation/components/dialog/animations/TextAnimationManager.js
used_by:
  - src/presentation/widgets/Dialog/index.js
---

# TextAnimationManager

Coordinates dialog text animations by queuing effects, resolving translations, and cancelling outstanding runs when the dialog resets. It maintains a registry of effect factories (typewriter and shuffle reveal by default) and serializes animation requests through a promise queue so only one message animates at a time.[^1]

When a message resolves to Emoji Protocol text, the manager skips animation and defers to `LanguageAdapter` to render the protocol block with proper labels.[^2] Errors are reported via a `log` event on the injected bus so the UI can surface failures without breaking rendering.[^3]

[^1]: Default config, effect registry, and queueing [src/presentation/components/dialog/animations/TextAnimationManager.js#L1-L78](../../../../../src/presentation/components/dialog/animations/TextAnimationManager.js#L1-L78)
[^2]: Emoji protocol detection and translation handling [src/presentation/components/dialog/animations/TextAnimationManager.js#L80-L140](../../../../../src/presentation/components/dialog/animations/TextAnimationManager.js#L80-L140)
[^3]: Abort handling and log emission [src/presentation/components/dialog/animations/TextAnimationManager.js#L141-L199](../../../../../src/presentation/components/dialog/animations/TextAnimationManager.js#L141-L199)
