# 1. Boot sequence and runtime mode

## 1.1 Entry point and mode selection

- `proto-dev/src/infrastructure/bootstrap/index.js` is the single entry point. It creates the dependency container via `composeApplication()` and asks `EmbeddingModeResolver` whether we are in `launcher` or full‑app mode.
- In launcher mode the `LauncherBootstrapper` is used; in the default path the `FullAppBootstrapper` is used.

## 1.2 Full application boot

`FullAppBootstrapper.boot()` performs the following steps in order:

1. Installs a `beforeunload` handler to dispose booted modules.
2. Boots logging and loader UIs.
3. Runs the loader flow, then boots all application modules and UI presenters.
4. Calls `_restoreState()` to decide which screen should open (welcome, registration, or messenger).

`_restoreState()` is the actual implementation of the narrative rule “the app is an access and filtering interface.” If a user already exists and has an avatar, it resumes straight into the messenger; otherwise it forces the registration path.

**Next:** [2. Configuration and dependency container](02-configuration-and-di.md)
