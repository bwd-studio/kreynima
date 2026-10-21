# BUILD 001 — editable drawing slice

This branch starts from BUILD 000 commit `2b8886d2b85b982dffbfb087de630573b03bff91` on `feat/build-000-foundation`. Its draft PR targets that foundation branch, depends on PR #1, and must not merge before the foundation is accepted. PR #1, its branch, LICENSE, brand policies, and inactive exception controls are not changed by this work.

## What is implemented

- SVG canvas with pointer capture, finite canvas coordinates, brush color and width, click dots, and temporary stroke preview. Preview becomes one validated command on release. Cancellation discards it. Very long gestures fail visibly rather than silently truncating. SVG is a view of identified vector points, not the authoritative project.
- Layers: add, select, rename, hide/show and move up/down. Bottom-first project order is rendered in that order; the UI lists topmost first. Drawing/erasing a hidden layer is rejected. Each layer owns one drawing in this slice.
- Whole-stroke eraser: a swept gesture tests segment distances, including intersections, dot strokes and brush radius. It removes touched strokes only from the selected visible layer. It does not split geometry or erase pixels. Removal commits on release and is undoable as one action.
- Pure shared commands with strict schemas, project invariants, revision conflict rejection, detached results, bounded undo/redo and no partial mutation on invalid input. All UI mutations and MCP mutations use the same engine.
- Three local stdio MCP tools: capabilities, project read and validated command dispatch. Each process owns an isolated temporary project. No desktop bridge, arbitrary execution, file access, server port, hosted model or paid service is added.

There is no file saving, autosave, opening, export, animation playback, timeline, selection/transform tool or point-editing UI. Closing/reloading loses the project; the window states this. Stored pressure is retained as input data, but rendered width is uniform and no pressure-sensitive brush is claimed. Pen/touch device behavior still needs real hardware testing. Layer deletion and project replacement are deliberately absent; the eraser is limited and reversible.

## Try it visually on Windows or macOS

After installing the [native prerequisites](building.md), check out `feat/build-001-drawing`, run `npm ci`, then `npm run desktop`. This is a test procedure, not evidence that these steps passed on a target OS.

1. Confirm a native KREYNIMA development window shows **BUILD 001**, a white canvas and **Layer 1**. Check startup output for compilation errors or Rust panics.
2. Draw a line and a click dot. Change color and size, then draw again; verify distinct colors and widths.
3. Add a layer, draw an overlapping line, then hide/show it. Select either layer and confirm only that layer receives new strokes. Hidden layers should reject drawing with a visible message.
4. Move the top layer down and back up; overlap colors should follow order. Rename it using the selected-name field and Enter or blur.
5. Select Eraser and sweep across several strokes. Only touched strokes on the selected layer should disappear on release. Undo restores that entire gesture; Redo repeats it. Undo then make a new edit: Redo should become unavailable.
6. Resize, minimize and restore. Confirm readable tools, correct pointer alignment and no observed startup/runtime error. Close and relaunch; expect an empty project because persistence is not implemented.
7. Also test the built executable using the [native smoke-test instructions](building.md#manual-native-window-smoke-test). Record exact commit, OS/version/architecture, commands, results and tester. A compiled binary alone is not a passed GUI test.

## Validation and remaining gates

See [BUILD 001 validation](build-001-validation.md) for actual results. BUILD 000 interactive tests do not verify the new drawing UI. Native Windows/macOS GUI tests must be repeated for this slice. This remains development work and is not release-ready.

BUILD 001 changes code and the dependency-state fingerprint. The BUILD 000 RUSTSEC-2024-0370 risk approval does **not** cover it. The scope and false activation control are left unchanged; the full unfiltered scan and independent advisory/license/source checks remain blocking. A regression test explicitly proves changed state cannot inherit the old approval. Resolve the dependency or obtain a separately reviewed disposition for this new scope; do not refresh fingerprints merely to obtain green CI.

## Browser-only development check

For a frontend-only visual session, `npm run dev` serves the UI at localhost:1420. This is not a native application launch. `npm run test:ui` builds the production frontend and runs Playwright against Vite preview; install its browser with `npx playwright install chromium` first (CI also installs system prerequisites). To use an already installed Chromium, set `KREYNIMA_CHROMIUM` to its executable path. Normal `npm run check` runs model/protocol/security tests without requiring a browser; the separate CI drawing job runs browser tests.

## Next-step proposal

[Persistent project saving and paired desktop MCP control](build-001-follow-up-proposal.md) are proposed as two separate small changes. They are not implemented. The [latest native-test attempt](build-001-validation.md#native-drawing-test-request--latest-recheck) remains blocked by the attached Linux environment; browser screenshots and native compilation are not substitutes for Windows/macOS drawing-window tests.
