# 11. Suggested reading order for newcomers

1. Start with `InterDeadReferenceLibrary/wiki/en` (especially `InterDead_application` and `Emoji_Protocol`) to understand the story contract.
2. Read the technical docs in this order:
   - [`docs/proto-dev/src/infrastructure/bootstrap`](../src/infrastructure/bootstrap/) → [`docs/proto-dev/src/app-shell/navigation/view-service.md`](../src/app-shell/navigation/view-service.md) → [`docs/proto-dev/src/messenger/application/dialog-orchestrator-service.md`](../src/messenger/application/dialog-orchestrator-service.md)
   - [`docs/proto-dev/src/presentation/widgets/Dialog`](../src/presentation/widgets/Dialog/) → [`docs/proto-dev/src/reactions/presentation/reaction-overlay-widget.md`](../src/reactions/presentation/reaction-overlay-widget.md) → [`docs/proto-dev/src/reactions/application/reaction-mapping-service.md`](../src/reactions/application/reaction-mapping-service.md)
   - [`docs/proto-dev/src/identity/application/profile-registration-service.md`](../src/identity/application/profile-registration-service.md) → [`docs/proto-dev/src/storage/browser/database-adapter.md`](../src/storage/browser/database-adapter.md)

This mirrors the app lifecycle: boot → registration → messenger → dialog → reactions → persistence.
