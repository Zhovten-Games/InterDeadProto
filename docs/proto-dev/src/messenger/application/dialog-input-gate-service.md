---
domains: []
emits:
  - DIALOG_AWAITING_INPUT_CHANGED
implements: []
imports:
  - src/runtime-events/domain/constants.js
  - src/narrative-runtime/engine/store.js
  - src/narrative-runtime/engine/actions.js
listens:
  - dialog.progress
owns:
  - _lastGhostIndex
  - bus
  - dialogManager
  - dualityManager
  - store
schemaVersion: 1
source: src/messenger/application/dialog-input-gate-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogInputGateService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DialogInputGateService

Controls when the application waits for user input by examining dialog progression. It advances ghost messages automatically until a user action is required and emits `DIALOG_AWAITING_INPUT_CHANGED` with the expected input kind and screen[^1]. Progression of dialog lines is delegated to the core store so effects like history saving can run[^2].

[`DialogOrchestratorService`](dialog-orchestrator-service.md) uses this gate to synchronize dialog flow with UI readiness and quest requirements[^3].

## Methods

- `advanceToUserTurn(dialog, fingerprints)` – evaluates the current dialog, progresses ghost lines, and emits awaiting status.
- `progressDialog()` – dispatches `dialogAdvance` so engine effects run while progressing the dialog.
- `boot()` – no automatic progression; the orchestrator triggers advancement after the dialog widget is ready.

[^1]: [src/messenger/application/dialog-input-gate-service.js](../../../../../proto-dev/src/messenger/application/dialog-input-gate-service.js)

[^2]: [src/messenger/application/dialog-input-gate-service.js](../../../../../proto-dev/src/messenger/application/dialog-input-gate-service.js)

[^3]: [src/messenger/application/dialog-orchestrator-service.js](../../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js)
