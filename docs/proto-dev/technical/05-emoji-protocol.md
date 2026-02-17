# 5. Emoji protocol mechanics in code

The Emoji Protocol is implemented by **structured message definitions** and **reaction workflows**, not by a linguistic parser. The mapping is:

## 5.1 Message structure

- Each ghost has a configuration file under `proto-dev/src/config/spirits` with staged `event` and `quest` definitions.
- These define messages with `author`, `text`, media, and reactions; the dialog engine treats them as deterministic steps rather than free text.

This directly implements the “Stack Form 6” and “RANGE/ACK” ideas from Emoji_Protocol: instead of raw lines, the contract is encoded as staged dialog data, reaction requirements, and stage transitions.

## 5.2 Reaction gates (ACK in UI form)

- Reaction eligibility is resolved by `ReactionMappingService` based on the active ghost and stage.
- `ReactionOverlayWidget` presents the emoji drum overlay when a reaction is required and emits `REACTION_SELECTED` with the chosen emoji.
- `ReactionPersistenceService` stores the selected emoji so the message can be confirmed later.

This is how “ACK = specific emoji” is enforced in practice: the user picks from a curated set, and the system persists that choice.

## 5.3 Emoji drum visibility (UI roulette)

The drum (roulette) is still implemented in the panel template and widgets, but **disabled by default**:

- `controlPanel.showEmojiDrum` is set to `false` in `default.config.js`.
- `ControlPanel.render()` hides the drum unless the current screen is the messenger and `showEmojiDrum` is enabled.

This is a deliberate UI choice: the mechanics exist for later activation without removing the infrastructure.

**Next:** [6. Camera quests and artifact capture](06-camera-quests.md)
