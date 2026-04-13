# Runtime reset boundaries

This document defines how account reset must interact with runtime state.

## Separation of concerns

- **Runtime state services** (`ButtonStateService`, `ButtonVisibilityService`) may only forget stale user/runtime data.
- UI state is rebuilt via event re-synchronization:
  - SCREEN_CHANGE must trigger policy default emission
  - runtime services must emit initial state when no overrides exist

UI must NOT depend on lazy getters (`isActive`/`isVisible`) for initialization.

- **Infrastructure runtime** (AI warmup/readiness) must not be reset by account/profile reset.

## Button state model

`ButtonStateService` stores **runtime overrides** only.

- Missing override does **not** necessarily mean `true`.
- Policy-level defaults are evaluated via `_getDefaultState(screen, action)`.
- Current policy defaults:
  - `messenger:post` => `true`
  - `camera:capture-btn` => `false`

This keeps reset semantics clean (`state = {}`) while still preserving required behavior for gated actions.

## Button visibility model

`ButtonVisibilityService` stores **runtime overrides** only.

- Missing override resolves through `_getDefaultVisibility(screen, action)`, but policy fallback must stay minimal and must not replace orchestration.
- Current policy defaults:
  - `messenger:toggle-camera` => `true`
  - `camera:toggle-messenger` => `false`
  - `messenger:post` => `true`
  - `camera:capture-btn` => `false`

## Reset contract

`ResetService` invokes runtime clear hooks on injected services.

Those hooks must:

- clear in-memory runtime data,
- clear persisted runtime keys only when reset options explicitly request persisted wipe,
- avoid synthetic per-screen/per-button emits inside runtime clear hooks.

After that, `APP_RESET_COMPLETED` and `SCREEN_CHANGE` drive normal re-derivation of UI state.

Initial per-screen/per-button emits are allowed only during normal UI re-synchronization
(for example after boot or `SCREEN_CHANGE`).

## Initial UI synchronization requirement

After boot or reset:

- runtime state may be empty
- storage may be empty

In this case, services must emit initial UI state explicitly.

Relying only on getters leads to "dead UI" (no updates emitted).

Runtime hooks should clear in-memory user context by default.
Persisted runtime keys are cleared only when reset options explicitly allow persisted wipe.
