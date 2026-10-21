# Editable project model — BUILD 001

`packages/project-format` now implements strict runtime validation, exported types and a validated default project. This remains an in-memory schema rather than a stable persisted format. The BUILD 000 types were an unused draft: BUILD 001 replaces the draft drawing dictionary with a drawing array and uses a single `drawingId` per layer instead of unimplemented exposures. No persisted projects exist to migrate; do not claim compatibility with a released file format.

A version-1 project has globally unique entity IDs, a name, a reserved frame rate, canvas dimensions, drawings and ordered layers. Each layer owns exactly one drawing; duplicate, missing and orphan references are rejected. Drawings contain identified strokes, each with an opaque six-digit hex color, uniform width in canvas pixels and ordered `{ x, y, pressure }` samples. IDs are bounded ASCII identifiers; names are trimmed and bounded. Validation returns detached canonical data, including lowercase colors.

Canvas coordinates start at the upper left, with x rightward and y downward. The default canvas is 960×540; samples must be finite and lie within inclusive canvas bounds. Pressure is finite in [0,1], recorded but not used for tapered rendering yet. Single-sample strokes are valid dots. Width is 1–64 canvas pixels. The UI maps its scaled SVG surface back to canvas coordinates and clamps captured points at its edges.

Limits: 32 layers/drawings, 1,000 strokes overall, 20,000 samples overall, 2,048 samples per stroke/eraser path, canvas dimensions 32–4,096, names 1–80 characters, frame rate 1–120. Unknown fields and schema versions are rejected. No source paths, executable content, remote resources or embedded scripts are supported.

Drawing-core owns geometry (whole-stroke hit testing and SVG path generation); command-engine owns atomic project transitions/history. React renders derived SVG paths without mutating authoritative data. Renderer/view caches are discardable. Layer order is bottom-first; hiding preserves all geometry. Erasing changes only the explicit visible target layer and is reversible.

Timeline exposures, keyframes, transforms, rigs, cameras and audio remain future work. A future schema should specify integer-frame timing/overlap rules, migrations, atomic persistence and recovery before claiming animated or durable projects. No playback, exposure evaluation, persistence or recovery is implemented in this slice.
