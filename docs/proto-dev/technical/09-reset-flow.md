# 9. Reset flow and safety

The “safe termination” idea from Emoji_Protocol (“🚫🧯”) is implemented as a global reset:

- `ViewService.resetData()` emits `APP_RESET_REQUESTED`.
- `ResetService` (booted in `FullAppBootstrapper`) clears persistence and database state.
- UI presenters dispose widgets and return the app to the welcome screen.

**Next:** [10. Cross‑references to narrative docs](10-cross-references.md)
