# Shared drawing commands — BUILD 001

`CommandEngine` is a pure, synchronous in-memory project session. The UI and MCP each construct one instance; they share implementation and schemas, not a running project. `read()` returns a detached `{ project, revision, canUndo, canRedo }` snapshot. Every mutation uses `dispatch({ command, expectedRevision })`. Revisions increase after successful edits, undo and redo; no-ops preserve revision/history. A stale revision fails without mutation.

| Command                         | Required fields                                  | Effect                                       |
| ------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `stroke.add`                    | `layerId`, `stroke: { id, color, size, points }` | Append an editable vector stroke             |
| `stroke.erase`                  | `layerId`, `path: Point[]`, `radius`             | Whole-stroke erasure along a swept path      |
| `layer.add`                     | `id`, `drawingId`, `name`                        | Add an empty visible layer on top            |
| `layer.rename`                  | `layerId`, `name`                                | Rename a layer                               |
| `layer.visibility`              | `layerId`, `visible`                             | Show/hide without deleting geometry          |
| `layer.move`                    | `layerId`, `index`                               | Reorder at a zero-based bottom-first index   |
| `project.rename`                | `name`                                           | Rename the in-memory project                 |
| `history.undo` / `history.redo` | None                                             | Restore previous/next complete project state |

Strict discriminated schemas reject unknown commands and extra fields. IDs/references, geometry, global limits and the resulting project are validated before committing. Errors carry `VALIDATION`, `CONFLICT`, `NOT_FOUND`, `HIDDEN_LAYER` or `EMPTY_HISTORY`. Failures do not consume revision or history. Results and caller inputs cannot mutate engine state through aliases.

Undo uses detached project snapshots: up to 40 edits, further pruned when undo snapshots exceed 100,000 stored points. Undo/redo transfers those snapshots; the current project can add up to 20,000 points to total history storage during transfer. New edits clear redo. There is no durable history, multi-user transaction protocol, arbitrary script command or native invocation.

`executeCommand({ type: "application.status" })` remains a strict, stateless capabilities query. It reports BUILD 001, `sessionScope: "capabilities-only"`, and command names. It does not claim any desktop session connection. The open project is read through the session engine, not inferred from capabilities.

Every future drawing operation must enter this same engine and gain UI/MCP parity tests. The MCP request schema is exported directly from the engine; adapters must not implement separate drawing rules.
