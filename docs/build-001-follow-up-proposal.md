# Smallest safe follow-up — proposal, not implemented

BUILD 001 currently has only in-memory drawings. Reloading or closing loses them. The standalone MCP process edits a different in-memory project. The native drawing test does not change either limitation. Keep both PRs draft/unmerged until their separate gates and maintainer decisions are satisfied; do not carry the BUILD 000 advisory acceptance into changed code.

## First: explicit project Save / Open

Start with one plain, versioned JSON document containing only the existing validated project data. No ZIP container, assets, autosave, migrations, network storage or scripting is needed for the first slice. Make the current in-memory schema an explicit reviewed file-format contract before writing user files. Retain schemaVersion and reject unsupported versions rather than guessing a migration.

- Add Save, Save As and Open through native OS dialogs. Dialog-selected paths are held by the native adapter, not accepted from arbitrary MCP arguments. Grant only the required Tauri capabilities and narrow Rust read/write commands; do not expose a generic filesystem API or add broad asset/path permissions.
- Keep one authoritative `CommandEngine` in the desktop. Snapshot for Save; enforce a byte limit before parsing Open, then strict schema/reference/resource validation. A failed read or invalid document must leave the open project unchanged. An explicit project-replacement command should clear history, advance the session revision and require the existing expected revision so stale clients cannot mutate a newly opened project.
- Implement same-directory temporary-file writes and tested atomic replacement on each target OS. Report success and update the saved-state marker only after the disk commit succeeds; clean temporary files on failure. Preserve an existing destination when write/replace fails. Ask before overwriting or abandoning unsaved edits. Handle cancellation, permission errors, full disks, symlinks and interrupted writes explicitly.
- Compare current document identity/content with the successfully saved snapshot when showing dirty state. A simple “last edited revision equals saved revision” rule would mishandle undo back to saved content. A background save finishing after more edits must not mark those later edits saved.
- Tests: round-trip editable strokes/layers, invalid/oversized/unknown-version documents, canceled dialogs, failed atomic replacement preserving existing bytes, stale revisions, undo/redo versus dirty state, and native Windows/macOS save-close-open with equivalent geometry. No “saved” indicator until those paths work.

This should be a small, separate draft PR after review, with no MCP filesystem tool initially. Persistence should work reliably for a local artist before adding a second client to the desktop session.

## Then: paired, local desktop MCP control

Keep the external MCP transport as local stdio. Replace its isolated engine with a small relay only when the user explicitly connects it to the desktop. The desktop engine remains the single owner of project data/history; do not create a second engine and attempt to synchronize copies.

The smallest connection should be one user, one desktop session, one paired client. Use an OS-protected local transport: a per-user named pipe with an explicit user SID ACL on Windows, or a Unix socket in a user-only directory on macOS. Add a fresh, high-entropy per-session pairing credential, timeout and revocation; keep credentials out of stdout, PRs, screenshots and logs. No public TCP/HTTP listener, remote service or general native invocation is necessary.

The desktop must display the requested client and scope, let the user approve read-only or drawing-edit access, show a connected indicator, and provide Disconnect. The native broker routes only a bounded allowlist to the existing frontend engine, with request IDs, deadlines, message/rate/queue limits, explicit revision checks and structured replies. It must verify pairing/authorization before routing, retain schema validation at the shared engine, serialize UI/MCP edits, and fail closed on window closure, reload, disconnected clients or malformed responses. Re-pair after a session restart. Do not forward arbitrary Tauri commands or JavaScript evaluation.

Expose drawing commands/read snapshots first; keep filesystem access outside this bridge. Advertise live connection only after it is real and tested. Mutation annotations are client hints, not authorization. Record minimal local audit metadata without project content or secrets.

Tests must prove a stdio MCP request changes the **same visible native canvas**, UI edits are returned to the client, undo history is shared, stale concurrent edits conflict, unpaired/read-only/revoked clients cannot mutate, invalid/oversized requests are rejected, and closure/reload cannot leave a writable stale session. Include real Windows/macOS pairing and disconnect sessions and transport-permission review before calling live desktop control complete.

Both follow-ups require separate implementation authorization, review of the then-current dependency/security scope, and honest native evidence. This document approves neither implementation nor merging nor a Rust security exception.
