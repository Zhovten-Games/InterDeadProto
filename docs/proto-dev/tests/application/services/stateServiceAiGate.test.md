---
domains: []
emits: []
implements: []
imports:
  - src/application/services/StateService.js
  - src/utils/Observer.js
listens: []
owns: []
schemaVersion: 1
source: tests/application/services/stateServiceAiGate.test.js
used_by: []
---

# stateServiceAiGate.test.js

Verifies that `StateService` correctly evaluates `localAuthReady` and `aiReady` rules. The test toggles local auth and AI state values and asserts that internal `_evaluate` returns the expected booleans for both rules.[^1]

[^1]: Rule evaluation assertions [tests/application/services/stateServiceAiGate.test.js#L5-L21](../../../tests/application/services/stateServiceAiGate.test.js#L5-L21)
