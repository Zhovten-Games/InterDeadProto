---
domains: []
emits:
  - CAMERA_VIEW_OPENED
  - DIALOG_WIDGET_READY
  - PROFILE_IMPORT_SELECTED
  - PROFILE_EXPORT_CONFIRMED
  - STATUS_SHOW
implements: []
imports:
  - proto-dev/src/core/events/NullEventBus.js
  - proto-dev/src/core/events/constants.js
  - proto-dev/src/presentation/components/forms/TextFieldAnimator.js
listens:
  - VIEW_RENDER_REQUESTED
  - VIEW_CAMERA_RENDER_REQUESTED
  - PROFILE_IMPORT_REQUESTED
  - PROFILE_EXPORT_REQUESTED
  - APP_RESET_COMPLETED
owns: []
schemaVersion: 1
source: proto-dev/src/presentation/adapters/GlobalViewPresenter.js
used_by:
  - proto-dev/src/infrastructure/bootstrap/modules/PresentationModule.js
---

# GlobalViewPresenter

Bridges application events to DOM updates: renders templates, initializes dialog/posts/camera/location widgets, and forwards profile transfer actions through modal workflows.[^1]

Current implementation also manages registration label typing animation (`TextFieldAnimator`), emits `DIALOG_WIDGET_READY` after dialog widget boot, and performs robust cleanup for reset/screen transitions (camera handles, listeners, preview URLs, and active widgets).[^2]

[^1]: Event subscriptions and screen rendering paths [proto-dev/src/presentation/adapters/GlobalViewPresenter.js#L1-L260](../../../../proto-dev/src/presentation/adapters/GlobalViewPresenter.js#L1-L260)
[^2]: Dialog/camera lifecycle, profile transfer modal handling, and cleanup [proto-dev/src/presentation/adapters/GlobalViewPresenter.js#L261-L430](../../../../proto-dev/src/presentation/adapters/GlobalViewPresenter.js#L261-L430)
