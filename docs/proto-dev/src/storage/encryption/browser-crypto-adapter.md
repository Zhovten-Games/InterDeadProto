---
domains: []
emits: []
implements:
  - IEncryption
imports:
  - src/storage/ports/encryption-port.js
listens: []
owns:
  - logger
schemaVersion: 1
source: src/storage/encryption/browser-crypto-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: encrypt
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# BrowserCryptoAdapter

Implements the `IEncryption` port using Web Crypto APIs. Keys are derived with PBKDF2 and AES‑GCM is used to encrypt or decrypt serialized objects[^1]. Errors are logged through the provided logger while JSON encoding is handled via `TextEncoder` and `TextDecoder`[^2][^3].

[^1]: [`BrowserCryptoAdapter.js`](../../../../../proto-dev/src/storage/encryption/browser-crypto-adapter.js)

[^2]: [`BrowserCryptoAdapter.js`](../../../../../proto-dev/src/storage/encryption/browser-crypto-adapter.js)

[^3]: [`IEncryption.js`](../../../../../proto-dev/src/storage/ports/encryption-port.js)
