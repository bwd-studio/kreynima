# Animation command architecture

BUILD 000 implements only `application.status`: deterministic, read-only, and independent of project/session state. It reports BUILD 000 capabilities and no open project. Both the frontend and MCP status tool call executeCommand.

Future commands should be typed discriminated unions with runtime-validated inputs and results. Validate authorization, project revision, references, and bounds before applying an atomic transaction. Return structured errors without partial mutations. Keep inverses or snapshots for undo/redo and add replay tests; neither history nor mutation exists yet.

Drawing creation, stroke editing, exposures, keyframes, rigs, and camera edits must flow through the same dispatcher from UI and MCP. Do not place business logic in React event handlers or protocol handlers. Put user consent and session capabilities at adapter boundaries; put data invariants in the engine. Destructive operations require explicit consent and revision checks. Batch operations need limits and rollback semantics. Native rendering jobs require cancellation and bounded resources through a narrow Rust API, never a generic process runner.
