# Editable project and exposure model

The types in packages/project-format are a draft in-memory starting point, not a persistence implementation. A version-1 project contains stable IDs, name, frame rate, reusable drawings, and layers. Drawings contain identified editable strokes with position and pressure samples. Layers refer to drawings through integer-frame exposures with explicit start and duration; held drawings reuse the same drawing ID rather than duplicating geometry.

Before persistence lands, runtime schemas must reject invalid IDs, nonfinite geometry, invalid pressure, dangling references, unsupported versions, invalid frame rates, overlaps, and resource-limit violations. Decide coordinate units, time origin, pressure range, maximum sizes, and overlap policy with fixtures in BUILD 001. TypeScript interfaces alone do not validate input.

Proposed evaluation: timeline-core resolves a layer's exposure at an integer frame; drawing-core evaluates its editable geometry; animation-core evaluates transforms; render-core composites the evaluated scene. Geometry and rendering caches are derived, discardable data. Drawing tools write commands; renderers never mutate authoritative project data.

Future schema revisions add scene hierarchy, editable transform keyframes, rigs, cameras, audio references, and asset provenance. These are not implemented fields. Plan a versioned container with JSON metadata and relative, content-addressed assets, atomic writes, migrations, and recovery; choose and test the actual format before promising compatibility. Never execute embedded project scripts or follow unsafe paths on import.
