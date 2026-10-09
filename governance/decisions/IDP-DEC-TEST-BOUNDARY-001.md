# IDP-DEC-TEST-BOUNDARY-001 — Test corpus restoration

Status: candidate. The baseline contains 231 test files; collection fails on an
unlocked sql.js dependency, a missing InterDeadIT session source, a missing text
animation component, and two foreign person-prototype tests. sql.js is now locked;
InterDeadIT session is a verbatim pinned MIT external fixture; the animation
contract is restored in the messenger capability. Every application test remains
in the active collection. Two person files are retained verbatim as archived
external evidence; their sources do not exist in any repository ref/history.
They are explicitly registered, hashed, and reported as external-source-unavailable.
No passing assertion is invented for that missing prototype. Recovery/moving
that foreign project into scope requires its canonical source and separate decision.
Unit files run in isolated processes; node:test and Mocha have separate collectors.
Tests cannot silently disappear from the declared manifest.
