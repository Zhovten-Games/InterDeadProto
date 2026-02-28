---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/spirits/sample.json
used_by: []
---

# Sample Spirit JSON

`sample.json` demonstrates the JSON format expected by `DualityConfigService`, defining unlock behaviour, an avatar, and ordered stages with chat events and optional quests[^1]. `DualityConfigService` fetches such JSON files when loading spirit definitions[^2].

## Authoring constraints for stable replay/reboot

- A quest is attached to a **stage boundary**, not to a message inside `event.messages`.
- You can place multiple `ghost -> user` turns inside one stage; this is the preferred pattern for long text-only onboarding blocks before the first quest.
- Avoid splitting one logical intro into many tiny text-only stages right before a quest. During replay/reboot this increases boundary churn and makes button-gate synchronization more fragile.
- If a user acknowledgement semantically belongs **after** a camera action, place that user message in the stage after the quest stage, not before the quest is executed.

[^1]: [`sample.json`](../../../src/config/spirits/sample.json#L1-L28)
[^2]: [`DualityConfigService.js`](../../../src/application/services/DualityConfigService.js#L1-L21)
