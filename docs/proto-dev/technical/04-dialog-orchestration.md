# 4. Messenger boot and dialog orchestration

This section maps the narrative “Emoji Protocol: Operation algorithm (basic cycle)” to the exact code flow.

## 4.1 Dialog orchestration entry point

`DialogOrchestratorService` is the core state machine for dialog:

- It is activated when `SCREEN_CHANGE` sends the user to the messenger.
- It loads the ghost configuration, injects avatars, and restores prior history.

## 4.2 History replay before live dialog

When the messenger screen opens:

1. The service loads persisted dialog history from `DialogHistoryService`.
2. It retains persisted occurrence identities and canonical sequence order in `_normalizeHistory()`.
3. It replaces the retained `DialogTimeline` snapshot. `DialogWidget` renders that snapshot;
   restoration emits no live `EVENT_MESSAGE_READY` events or live effects.

This is the technical equivalent of “continuation of the conversation is determined by validity of the response and confirmation via ACK.” The history replay is the memory layer that makes the “contract” observable in the UI.

## 4.3 Who speaks first (ghost or user)

The “who speaks first” rule is enforced by `DialogInputGateService.advanceToUserTurn()`:

- It auto‑advances all consecutive ghost messages until a user‑authored line is reached.
- It emits `DIALOG_AWAITING_INPUT_CHANGED` with `kind=user_text` when a user reply is expected.
- If the dialog is complete but a quest is active, it emits `kind=camera_capture` instead.

This precisely implements the narrative “node defines RANGE and we respond.” If the next message is authored by the ghost, it is auto‑progressed; if the next message is authored by the user, the UI unlocks the post button and waits.

## 4.4 Posting a user response

When the user presses “Post”:

- `DialogOrchestratorService` receives the `post` event and applies a **post lock** to avoid double submissions.
- It attaches the current avatar to the upcoming user message.
- It advances the dialog through `DialogInputGateService.progressDialog()` (or through engine actions if the gate is missing).
- Every gate evaluation derives both the command lock and the visible Post state from the
  current turn and screen. An already-awaited user turn resumes after camera return without
  needing a new message event.
- A pending avatar lookup owns a `_postingTurn` token. Widget readiness preserves that lock;
  screen departure, reset or a contact transition cancels it. Its late result cannot advance
  the restored or newly selected conversation.
- The current posting operation releases its token in `finally`; the next turn determines
  whether Post becomes available.

Snapshot replacement starts a new render generation. Old template, media and animation
awaits cannot commit DOM, counters or scroll state to it. Loading older messages shares the
current generation's render queue; live acceptance during that operation remains renderable.
See [recovery scenarios](messenger-recovery-2026-10-10.md).

This is the concrete version of “the contract defines admissibility, ACK, and what happens next.” The system uses message authorship and the input gate to decide who can act next.

**Next:** [5. Emoji protocol mechanics in code](05-emoji-protocol.md)
