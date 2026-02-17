# 2. Configuration and dependency container

## 2.1 Centralized configuration

- The app loads `default.config.js` and merges it with the active spirit configuration (selected via `APP_SPIRIT`).
- The merged config influences UI and flow logic (e.g., chat display mode and emoji drum visibility).

## 2.2 Dependency injection

- Bootstrap modules in `proto-dev/src/infrastructure/bootstrap/modules` register all application services.
- This is the literal code realization of the narrative “interface rather than direct communication”: the app is composed of adapters and ports rather than monolithic scripts.

**Next:** [3. Registration pipeline (profile creation)](03-registration-pipeline.md)
