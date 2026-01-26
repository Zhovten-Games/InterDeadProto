---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/IEncryption.js
used_by:
  - src/adapters/encryption/BrowserCryptoAdapter.js
---

# IEncryption Port

Specifies encryption and decryption operations to protect sensitive data handled by the application.[^1] Implementations secure persisted records before they reach storage layers.[^3]

## Relations
- Import test confirms the interface exists.[^2]
- Often paired with `IPersistence` to encrypt stored data.[^3]
- Observes standard port naming guidelines.[^4]

[^1]: [src/ports/IEncryption.js](../../src/ports/IEncryption.js#L1)
[^2]: [tests/ports/testIEncryption.test.js](../../tests/ports/testIEncryption.test.js#L3-L14)
[^3]: [src/ports/IPersistence.js](../../src/ports/IPersistence.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
