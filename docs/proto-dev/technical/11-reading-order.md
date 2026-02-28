# 11. Suggested reading order for newcomers

1. Start with `InterDeadReferenceLibrary/wiki/en` (especially `InterDead_application` and `Emoji_Protocol`) to understand the story contract.
2. Read the technical docs in this order:
   - [`docs/proto-dev/src/infrastructure/bootstrap`](../src/infrastructure/bootstrap/) → [`docs/proto-dev/src/application/services/ViewService.md`](../src/application/services/ViewService.md) → [`docs/proto-dev/src/application/services/DialogOrchestratorService.md`](../src/application/services/DialogOrchestratorService.md)
   - [`docs/proto-dev/src/presentation/widgets/Dialog`](../src/presentation/widgets/Dialog/) → [`docs/proto-dev/src/presentation/widgets/ReactionOverlayWidget.md`](../src/presentation/widgets/ReactionOverlayWidget.md) → [`docs/proto-dev/src/application/services/ReactionMappingService.md`](../src/application/services/ReactionMappingService.md)
   - [`docs/proto-dev/src/application/services/ProfileRegistrationService.md`](../src/application/services/ProfileRegistrationService.md) → [`docs/proto-dev/src/adapters/database/DatabaseAdapter.md`](../src/adapters/database/DatabaseAdapter.md)

This mirrors the app lifecycle: boot → registration → messenger → dialog → reactions → persistence.
