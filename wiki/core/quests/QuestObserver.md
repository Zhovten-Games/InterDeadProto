---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/quests/QuestObserver.js
used_by: []
---

# QuestObserver

Abstract observer for quest lifecycle events.[^1]  
Implementers override `onStart` and `onComplete` to react to quest progression, mirroring the events emitted by `Quest`.[^2]

[^1]: [src/core/quests/QuestObserver.js#L1-L4](../../../src/core/quests/QuestObserver.js#L1-L4)  
[^2]: [src/core/quests/QuestObserver.js#L5-L22](../../../src/core/quests/QuestObserver.js#L5-L22); [src/core/quests/Quest.js#L21-L33](../../../src/core/quests/Quest.js#L21-L33)
