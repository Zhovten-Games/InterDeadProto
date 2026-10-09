---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/quests/domain/quest-observer.js
used_by: []
source_exists: true
runtime_role: QuestObserver
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# QuestObserver

Abstract observer for quest lifecycle events.[^1]  
Implementers override `onStart` and `onComplete` to react to quest progression, mirroring the events emitted by `Quest`.[^2]

[^1]: [src/quests/domain/quest-observer.js#L1-L4](../../../../../proto-dev/src/quests/domain/quest-observer.js)

[^2]: [src/quests/domain/quest-observer.js#L5-L22](../../../../../proto-dev/src/quests/domain/quest-observer.js); [src/quests/domain/quest.js#L21-L33](../../../../../proto-dev/src/quests/domain/quest.js)
