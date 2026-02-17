# 8. Ghost switching and completion

- `GhostSwitchService` tracks which ghosts are completed and uses their unlock rules to expose new spirits.
- `DialogOrchestratorService` listens for `DUALITY_COMPLETED` and marks ghosts as completed, then enables the ghost switcher button.
- `PanelAdapter` rebuilds the switcher list and emits `GHOST_CHANGE` events when the user selects another spirit.

This turns the narrative “serial contacts” into a deterministic unlock pipeline.

**Next:** [9. Reset flow and safety](09-reset-flow.md)
