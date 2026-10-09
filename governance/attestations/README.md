# Ratification evidence

No ratification has been asserted. Before public release, the competent humans
complete PROFILE P02/P05/P10–P14, record their decision and sign/date the frozen
normative package. ratification.json must contain schemaVersion=1, status=operative,
decision path, reviewers (nonempty), UTC date, and documents mapping each path in
PROFILE/DEVELOPMENT/base-adoption/acts/waivers/rule-checks/technical-regulators/
dependencies/LICENSE/LICENSING-OVERRIDES to its SHA-256. The exact paths are
`normativeDocuments` in constitutional-guard/governance.mjs. acts.json statuses
must then be operative.
PROFILE and DEVELOPMENT status labels, base-adoption, dependency adoption and
technical-regulator records must agree with that operative state. Update the
candidate-only explanation when recording actual adoption. A protected registry
change requires the reviewed controlChange record described in WARDEN README;
ratification does not silently refresh historical/control hashes.
WARDEN checks hashes and completeness; it cannot authenticate a human signature.
Manual evidence separately binds the exact release artifact. Never use sample
reviewers/results as actual evidence.
