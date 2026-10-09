# Dialog schema v2 migration and recovery

One profile/database owns per-spirit timelines. Sequence is allocated atomically
under a single browser writer lease; SQL.js snapshots require Web Locks in the
production persistent browser path. Without that API, boot refuses safely.

Before an existing dialog table is upgraded, the complete SQLite snapshot is
saved as sqlite_db_backup_before_dialog_v2. Migration orders legacy records by
ts, order_idx, rowid, fingerprint within each ghost, preserves original identity,
timestamp, reactions, profile/media references, and records chronology_origin.
This deterministic approximation does not recover lost narrative chronology.
Schema version prevents repeat migration. Appending never renumbers existing
rows or changes created metadata. Reaction edits use a separate update contract.

Import is one synchronous database transaction with a separate recovery snapshot.
V2 exported gapped sequences are preserved; legacy import follows declared order
and receives sequential values. Conflicting V2 sequence/identity refuses without
changing the current save. Any SQL or persisted-snapshot failure restores the
entire pre-write database in memory; the previous saved value remains valid.

To recover a backup, export the current save first, stop all app tabs, then under
an authorized recovery session restore the backup value to sqlite_db and reload.
Never replace it with an empty database. A previous runtime can use the backup;
it must not write the v2 database concurrently. Development fixture reset is
explicit; production migration never discards user data automatically.

## Atomic profile context and recovery drill

Schema 2 export includes SQLite, durable media and meta.progress. Import validates a
private fork and commits sqlite_db, userId/captured, ghostType, progress and prefs
in one LocalStorage write to interdead:user-context:v1. Reads use this authoritative
envelope; legacy keys remain as recovery sources and are not silently resurrected.
Backups sqlite_db_backup_before_profile_import and
sqlite_context_backup_before_profile_import are created once before replacement.
Repeated imports preserve the original backup. Quota refusal changes neither
authoritative database nor profile context. Missing atomic persistence refuses import.

Recovery drill is a mandatory human case on an isolated copy of a real save: export
current profile and raw storage; close other writer tabs; verify the backup is valid
SQLite/context and belongs to that profile; restore context envelope or the original
legacy SQLite in a recovery session; load the corresponding verified runtime; inspect
profile, media/reactions, quest/duality/completion and bear→bed continuation. Record
source/artifact hashes and observed result before using the procedure in production.
When restoring legacy keys, first archive the current envelope and remove its active
key so it cannot override the restored legacy state. Never overwrite immutable backups
or unrelated host storage. Data downgrade to an older runtime requires its original
backup; the old application does not understand the new context envelope/schema.
