# BUILD 001–005 roadmap

The founder has authorized a narrower drawing-first BUILD 001 slice; its [scope](build-001.md) and [validation](build-001-validation.md) supersede item 1 below for this branch. Persistence and recovery are deferred; BUILD 002 scope must be reassessed after review. The numbered list retains the original planning context, not a claim of completed functionality. Each build should have focused PRs, passing boundary tests, and honest platform validation.

1. **BUILD 001 — Project lifecycle:** runtime schemas, stable IDs/units/frame rules, fixture projects, validated create/open/save, migrations policy, atomic writes and recovery. Narrow native filesystem permissions; corrupted-file tests. First resolve BUILD 000 native launch/CI, Cargo lockfile, ownership, and reporting contacts.
2. **BUILD 002 — Editable drawing:** stroke commands, pressure-aware geometry, layer operations, viewport input, selection, undo/redo. Test replay and geometry invariants. All actions use the shared engine.
3. **BUILD 003 — Timeline and exposures:** deterministic integer-frame evaluation, holds, playback, onion skin, exposure editing. Test frame boundaries, overlaps, and UI/MCP parity.
4. **BUILD 004 — Animation and collaboration:** transform keyframes and interpolation, initial camera model, authenticated desktop-session MCP bridge, scoped capabilities, approval and rollback behavior. Rigs remain a separately scoped design unless explicitly included.
5. **BUILD 005 — Local film pipeline:** deterministic render jobs, cancellation, frame sequence export, optional FFmpeg encoding with reviewed licenses and safe argument construction. Windows/macOS packaging and signing evaluation; optional Blender integration spike only after editable core works.

Director and Co-Create modes require the session bridge and mutation tools; Artist Mode requires actual drawing/timeline tooling. None should be advertised as delivered in BUILD 000.
