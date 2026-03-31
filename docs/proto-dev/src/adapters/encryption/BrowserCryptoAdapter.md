---
domains: []
emits: []
implements: []
imports: 
  - src/ports/IEncryption.js
listens: []
owns: []
schemaVersion: 1
source: src/adapters/encryption/BrowserCryptoAdapter.js
used_by: 
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
source_exists: true
runtime_role: browser_crypto_adapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# BrowserCryptoAdapter

Implements the `IEncryption` port using Web Crypto APIs. Keys are derived with PBKDF2 and AES‑GCM is used to encrypt or decrypt serialized objects[^1]. Errors are logged through the provided logger while JSON encoding is handled via `TextEncoder` and `TextDecoder`[^2][^3].

[^1]: [`BrowserCryptoAdapter.js`](../../../src/adapters/encryption/BrowserCryptoAdapter.js#L1-L47)
[^2]: [`BrowserCryptoAdapter.js`](../../../src/adapters/encryption/BrowserCryptoAdapter.js#L49-L75)
[^3]: [`IEncryption.js`](../../../src/ports/IEncryption.js#L1-L1)

