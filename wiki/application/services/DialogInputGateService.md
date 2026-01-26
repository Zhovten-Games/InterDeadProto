---
domains: []
emits:
  - DIALOG_AWAITING_INPUT_CHANGED
implements: []
imports:
  - src/core/engine/actions.js
  - src/core/engine/store.js
  - src/core/events/constants.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/DialogInputGateService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogInputGateService

Controls when the application waits for user input by examining dialog progression. It advances ghost messages automatically until a user action is required and emits `DIALOG_AWAITING_INPUT_CHANGED` with the expected input kind and screen[^1]. Progression of dialog lines is delegated to the core store so effects like history saving can run[^2].

[`DialogOrchestratorService`](./DialogOrchestratorService.md) uses this gate to synchronize dialog flow with UI readiness and quest requirements[^3].

## Methods

- `advanceToUserTurn(dialog, fingerprints)` – evaluates the current dialog, progresses ghost lines, and emits awaiting status.
- `progressDialog()` – dispatches `dialogAdvance` so engine effects run while progressing the dialog.
- `boot()` – no automatic progression; the orchestrator triggers advancement after the dialog widget is ready.

[^1]: [src/application/services/DialogInputGateService.js](../../src/application/services/DialogInputGateService.js#L24-L69)
[^2]: [src/application/services/DialogInputGateService.js](../../src/application/services/DialogInputGateService.js#L71-L88)
[^3]: [src/application/services/DialogOrchestratorService.js](../../src/application/services/DialogOrchestratorService.js#L25-L73)
