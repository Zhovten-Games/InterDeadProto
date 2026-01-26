== InterDead Application (Technical Realization) ==

This document retells the narrative flow from [[InterDead_application]] and [[Emoji_Protocol]] in purely technical terms. It is written for beginners: it names the classes/services that do the work, the events they wait for, and the concrete conditions that move the app from registration to dialog completion.

When a paragraph references a narrative step, it explicitly points back to the relevant section in the wiki (e.g., Emoji_Protocol “Operation algorithm” or “RANGE/ACK”). The goal is to explain how those rules are enforced in code.

== 0. Scope, trust model, and implementation status ==

This section draws a hard line between what is implemented in the application and what is a narrative framing described in [[Emoji_Protocol]] and [[InterDead_application]]. The narrative documents are important, but they also include conceptual or world-building elements that are not present as runtime features.

=== 0.1 What the system is (and is not) ===
* **Not a chat or messenger.** The runtime is a scripted contract executor with a fixed stage sequence and input gates.
* **No model of “two humans in free conversation.”** The UI only opens input when the gate allows it; otherwise it advances deterministically.
* **Protocol definition.** “Protocol” here means **notation + scripted contract + deterministic transitions** (state machine), not a general-purpose language of communication.

=== 0.2 Trust model and contract guarantees ===
* **Source of truth.** The contract is authored in first-party configuration (`src/config/spirits` + `default.config.js`).
* **What “contract compliance” means in practice (invariants):**
  1) **Input gating** is enforced by `DialogInputGateService`.
  2) **ACK/reaction requirements** are enforced by reaction mapping + persistence.
  3) **Stage transitions** are deterministic and read from the stage config.
  4) **Replay/history** is reconstructed from persisted dialog data.
* **What is not guaranteed.** There is no guarantee of contract enforcement for arbitrary external input or free-form two-way communication, because that is outside the target scope.

=== 0.3 Implementation status tags ===
When reading the narrative documents, treat features as one of:
* **Implemented** — exists in code and can be traced to a service or config.
* **Spec-only (concept)** — described for clarity or world-building, but not a runtime mechanism.
* **Planned** — explicitly intended but not yet implemented.

This technical document only claims **Implemented** behavior; narrative-only features are called out as **Spec-only (concept)**.

=== 0.4 Term mapping: narrative term → runtime realization ===
* **RANGE** → input gating and turn ownership (`DialogInputGateService`).
* **ACK** → reaction requirement + persistence (`ReactionMappingService`, `ReactionPersistenceService`).
* **OUTPUT-FORM** → message shape in stage config (text, media, camera quest).
* **POLICY** → configuration + deterministic stage flow (not a separate “language mode”).
* **stage/step** → `stages[]` entries in the spirit config.
* **gate** → dialog input gate (`kind=user_text`, `kind=camera_capture`).
* **reaction requirements** → stage `reactions` + overlay widget.

The contract is materialized as stage configuration and executed by the dialog state machine (`DialogOrchestratorService`).

=== 0.5 Stack Form 6 status ===
**Stack Form 6** currently functions as a **human-readable notation** for documentation and authoring. It is not required to exist as a distinct runtime object; the actual runtime schema is the stage config + dialog history.

=== 0.6 POLICY modes (🧱/🔀/🌀/⚠️/🚫🧯) — runtime vs narrative ===
* **🧱 baseline flow** — implemented via deterministic stage ordering + gating.
* **🔀 branching** — currently not a distinct runtime mode; any “branching” must be encoded manually in config.
* **🌀 simulations/counterfactuals** — **Spec-only (concept)** in the current code.
* **⚠️ risk/limited escalation** — **Spec-only (concept)** unless manually described in text.
* **🚫🧯 stop/reset** — implemented as the global reset flow (Section 9).

=== 0.7 Safety: enforcement vs authoring discipline ===
Safety is currently achieved by **authoring discipline** in first-party configs and minimal runtime gating. There is no general-purpose validator or anti-abuse layer for arbitrary external input. Any safety boundaries should therefore be documented as part of the authoring policy.

=== 0.8 Exposure/stealth and “effect regulators” ===
* The emoji drum/roulette exists in the UI but is **disabled by default** (Section 5.3).
* “Stealth/exposure/drum/roulette” should be treated as **implementation-level toggles**, not user-facing protocol commands.
* If additional exposure modes are introduced later, they should be marked **Planned** until wired in the runtime.

=== 0.9 Output forms and input limits ===
* The user can only input what the gate allows: text posts, reaction selection, or camera capture during a quest.
* There is **no free input channel** outside the current gated step.

== 1. Boot sequence and runtime mode ==

=== 1.1 Entry point and mode selection ===
* `src/infrastructure/bootstrap/index.js` is the single entry point. It creates the dependency container via `composeApplication()` and asks `EmbeddingModeResolver` whether we are in `launcher` or full-app mode.
* In launcher mode the `LauncherBootstrapper` is used; in the default path the `FullAppBootstrapper` is used.

=== 1.2 Full application boot ===
`FullAppBootstrapper.boot()` performs the following steps in order:
1) Installs a `beforeunload` handler to dispose booted modules.
2) Boots logging and loader UIs.
3) Runs the loader flow, then boots all application modules and UI presenters.
4) Calls `_restoreState()` to decide which screen should open (welcome, registration, or messenger).

`_restoreState()` is the actual implementation of the narrative rule “the app is an access and filtering interface” (InterDead_application “Limitations” section). If a user already exists and has an avatar, it resumes straight into the messenger; otherwise it forces the registration path.

== 2. Configuration and dependency container ==

=== 2.1 Centralized configuration ===
* The app loads `default.config.js` and merges it with the active spirit configuration (selected via `APP_SPIRIT`).
* The merged config influences UI and flow logic (e.g., chat display mode and emoji drum visibility).

=== 2.2 Dependency injection ===
* Bootstrap modules in `src/infrastructure/bootstrap/modules` register all application services.
* This is the literal code realization of the narrative “interface rather than direct communication”: the app is composed of adapters and ports rather than monolithic scripts.

== 3. Registration pipeline (profile creation) ==

=== 3.1 Screen changes and progression ===
The `ViewService` watches `SCREEN_CHANGE` events and decides which template to render. It also handles the “Next” button path:
* welcome → registration → apartment-plan → registration-camera.
* It refuses to advance from registration until `ProfileRegistrationService.canProceed()` is true.

This is the technical counterpart of “establishing access” in the narrative.

=== 3.2 Name capture ===
When the registration name input changes, `ViewService` receives `REGISTRATION_NAME_CHANGED` and forwards the value to `ProfileRegistrationService.setName()`.
* The same handler emits `NEXT_BUTTON_ENABLE` only when `ProfileRegistrationService.canProceed()` returns true.

=== 3.3 Avatar capture ===
The avatar capture is performed in the `registration-camera` screen:
* `ViewService` switches to camera mode and boots `CameraSectionManager` with a **registration** strategy.
* `ViewService.handleCaptureEvents()` either uses the last successful detection or triggers a fresh capture.
* On detection success, `_storeAvatarFromBlob()` converts the blob to base64, stores it in `ProfileRegistrationService`, and emits `CAMERA_PREVIEW_READY` so the preview UI is visible.

=== 3.4 Finalizing registration ===
When the user taps “Finish”:
* `ViewService.handleCaptureEvents()` ensures presence + avatar are true.
* It calls `ProfileRegistrationService.saveProfile()`, which writes the profile to the SQL.js database and emits `USER_PROFILE_SAVED`.
* `ViewService` persists `userId` + `captured` flags, notifies the user, and moves to `SCREEN_CHANGE: messenger`.

== 4. Messenger boot and dialog orchestration ==

This section maps the narrative “Emoji Protocol: Operation algorithm (basic cycle)” to the exact code flow.

=== 4.1 Dialog orchestration entry point ===
`DialogOrchestratorService` is the core state machine for dialog:
* It is activated when `SCREEN_CHANGE` sends the user to the messenger.
* It loads the ghost configuration, injects avatars, and restores prior history.

=== 4.2 History replay before live dialog ===
When the messenger screen opens:
1) The service loads persisted dialog history from `DialogHistoryService`.
2) It normalizes timestamps/fingerprints in `_normalizeHistory()`.
3) It replays the messages with `EVENT_MESSAGE_READY` so the UI can re-render them.

This is the technical equivalent of “continuation of the conversation is determined by validity of the response and confirmation via ACK” (Emoji_Protocol “Purpose” and “Operation algorithm”). The history replay is the memory layer that makes the “contract” observable in the UI.

=== 4.3 Who speaks first (ghost or user) ===
The “who speaks first” rule is enforced by `DialogInputGateService.advanceToUserTurn()`:
* It auto-advances all consecutive ghost messages until a user-authored line is reached.
* It emits `DIALOG_AWAITING_INPUT_CHANGED` with `kind=user_text` when a user reply is expected.
* If the dialog is complete but a quest is active, it emits `kind=camera_capture` instead.

This precisely implements the narrative “node defines RANGE and we respond” (Emoji_Protocol “Operation algorithm”). If the next message is authored by the ghost, it is auto-progressed; if the next message is authored by the user, the UI unlocks the post button and waits.

=== 4.4 Posting a user response ===
When the user presses “Post”:
* `DialogOrchestratorService` receives the `post` event and applies a **post lock** to avoid double submissions.
* It attaches the current avatar to the upcoming user message.
* It advances the dialog through `DialogInputGateService.progressDialog()` (or through engine actions if the gate is missing).
* Once the next message is emitted (`EVENT_MESSAGE_READY`), the lock is released and the gate evaluates again.

This is the concrete version of “the contract defines admissibility, ACK, and what happens next” (Emoji_Protocol “RANGE: continuation contract”). The system uses message authorship and the input gate to decide who can act next.

== 5. Emoji protocol mechanics in code ==

The Emoji Protocol is implemented by **structured message definitions** and **reaction workflows**, not by a linguistic parser. The mapping is:

=== 5.1 Message structure ===
* Each ghost has a configuration file under `src/config/spirits` with staged `event` and `quest` definitions.
* These define messages with `author`, `text`, media, and reactions; the dialog engine treats them as deterministic steps rather than free text.

This directly implements the “Stack Form 6” and “RANGE/ACK” ideas from Emoji_Protocol: instead of raw lines, the contract is encoded as staged dialog data, reaction requirements, and stage transitions.

=== 5.2 Reaction gates (ACK in UI form) ===
* Reaction eligibility is resolved by `ReactionMappingService` based on the active ghost and stage.
* `ReactionOverlayWidget` presents the emoji drum overlay when a reaction is required and emits `REACTION_SELECTED` with the chosen emoji.
* `ReactionPersistenceService` stores the selected emoji so the message can be confirmed later.

This is how “ACK = specific emoji” is enforced in practice: the user picks from a curated set, and the system persists that choice.

=== 5.3 Emoji drum visibility (UI roulette) ===
The drum (roulette) is still implemented in the panel template and widgets, but **disabled by default**:
* `controlPanel.showEmojiDrum` is set to `false` in `default.config.js`.
* `ControlPanel.render()` hides the drum unless the current screen is the messenger and `showEmojiDrum` is enabled.

This is a deliberate UI choice: the mechanics exist for later activation without removing the infrastructure.

== 6. Camera quests and artifact capture ==

This section implements the narrative “Artifacts” and “Operation algorithm” steps where a response can be an image or object.

=== 6.1 Quest activation ===
* When a dialog stage completes, `DialogOrchestratorService` calls `dualityManager.completeCurrentEvent()`.
* The duality manager activates a quest, and `DialogInputGateService` switches to `kind=camera_capture`.
* `ControlPanel` highlights the camera button to guide the user to the quest screen.

=== 6.2 Capture and overlay ===
When the user opens the camera:
* `ViewService` starts a **quest camera strategy** and listens for `DETECTION_DONE_EVENT`.
* On successful detection, `CameraSectionManager.captureOverlay()` applies quest overlays and stores the result.
* The final output is treated like an artifact: it can be replayed in dialog history or stored in media repositories.

== 7. History, persistence, and recovery ==

=== 7.1 Database as persistent memory ===
`DatabaseAdapter` boots SQL.js and stores its binary image in persistence (`sqlite_db`). It creates tables for users, posts, locations, and dialog messages. This is the mechanical basis of “memory fragments” described in InterDead_application.

=== 7.2 Dialog history buffering ===
`DialogHistoryBuffer` collects messages that arrive while the UI widget is not ready (e.g., during screen transitions). The orchestrator merges the buffer into history and replays it once the dialog widget is ready.

This avoids “silent gaps” and replaces the removed “no_messages” placeholder logic. The UI is always reconstructed from stored and buffered history rather than an empty-state label.

== 8. Ghost switching and completion ===

* `GhostSwitchService` tracks which ghosts are completed and uses their unlock rules to expose new spirits.
* `DialogOrchestratorService` listens for `DUALITY_COMPLETED` and marks ghosts as completed, then enables the ghost switcher button.
* `PanelAdapter` rebuilds the switcher list and emits `GHOST_CHANGE` events when the user selects another spirit.

This turns the narrative “serial contacts” into a deterministic unlock pipeline.

== 9. Reset flow and safety ==

The “safe termination” idea from Emoji_Protocol (“🚫🧯”) is implemented as a global reset:
* `ViewService.resetData()` emits `APP_RESET_REQUESTED`.
* `ResetService` (booted in `FullAppBootstrapper`) clears persistence and database state.
* UI presenters dispose widgets and return the app to the welcome screen.

== 10. Cross-references to narrative wiki sections ==

* Emoji_Protocol “Operation algorithm (basic cycle)” → Dialog orchestration + input gate (Sections 4.1–4.4).
* Emoji_Protocol “RANGE / ACK” → reaction mapping + overlay + persistence (Section 5.2).
* InterDead_application “Stealth mode” → no explicit exposure toggles exist in UI; the app ships with only the default state (Sections 2.1, 5.3).
* InterDead_application “Artifacts” → camera capture and overlay pipeline (Section 6).

== 11. Suggested reading order for newcomers ==

1) Start with [[InterDead_application]] and [[Emoji_Protocol]] to understand the story contract.
2) Read the technical wiki in this order:
   * infrastructure/bootstrap → application/services/ViewService → application/services/DialogOrchestratorService
   * presentation/widgets/Dialog → presentation/widgets/ReactionOverlayWidget → application/services/ReactionMappingService
   * application/services/ProfileRegistrationService → adapters/database/DatabaseAdapter

This mirrors the app lifecycle: boot → registration → messenger → dialog → reactions → persistence.
