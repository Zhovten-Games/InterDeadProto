---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/storage/ports/encryption-port.js
used_by:
  - src/storage/encryption/browser-crypto-adapter.js
source_exists: true
runtime_role: IEncryption
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# IEncryption Port

Specifies encryption and decryption operations to protect sensitive data handled by the application.[^1] Implementations secure persisted records before they reach storage layers.[^3]

## Relations

- Import test confirms the interface exists.[^2]
- Often paired with `IPersistence` to encrypt stored data.[^3]
- Observes standard port naming guidelines.[^4]

[^1]: [src/storage/ports/encryption-port.js](../../../../../proto-dev/src/storage/ports/encryption-port.js)

[^2]: [tests/ports/testIEncryption.test.js](../../../../../proto-dev/tests/storage/test-i-encryption.test.js)

[^3]: [src/storage/ports/persistence-port.js](../../../../../proto-dev/src/storage/ports/persistence-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
