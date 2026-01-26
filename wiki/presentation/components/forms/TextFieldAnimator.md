---
domains: []
emits: []
implements: []
imports:
  - src/presentation/components/dialog/animations/TypewriterCascadeEffect.js
listens: []
owns: []
schemaVersion: 1
source: src/presentation/components/forms/TextFieldAnimator.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
  - src/presentation/adapters/GlobalViewPresenter.js
---

# TextFieldAnimator

Utility that plays the shared `TypewriterCascadeEffect` against plain text inputs or labels. `animate` replaces the element text with a streaming animation, cancelling any previous run via an `AbortController` so repeated renders restart cleanly.[^1]

`cancel` aborts the active animation if one exists, and `_createEffect` isolates factory instantiation to guard against runtime errors from the effect constructor.[^2]

[^1]: Construction, effect factory usage, and animation workflow [src/presentation/components/forms/TextFieldAnimator.js#L1-L33](../../../../src/presentation/components/forms/TextFieldAnimator.js#L1-L33)
[^2]: Cancellation guard and effect factory fallback [src/presentation/components/forms/TextFieldAnimator.js#L9-L39](../../../../src/presentation/components/forms/TextFieldAnimator.js#L9-L39)
