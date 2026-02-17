# 11. Suggested reading order for newcomers

1. Start with `InterDeadReferenceLibrary/wiki/en` (especially `InterDead_application` and `Emoji_Protocol`) to understand the story contract.
2. Read the technical docs in this order:
   - `docs/proto-dev/infrastructure/bootstrap` → `docs/proto-dev/application/services/ViewService.md` → `docs/proto-dev/application/services/DialogOrchestratorService.md`
   - `docs/proto-dev/presentation/widgets/Dialog` → `docs/proto-dev/presentation/widgets/ReactionOverlayWidget.md` → `docs/proto-dev/application/services/ReactionMappingService.md`
   - `docs/proto-dev/application/services/ProfileRegistrationService.md` → `docs/proto-dev/adapters/database/DatabaseAdapter.md`

This mirrors the app lifecycle: boot → registration → messenger → dialog → reactions → persistence.
