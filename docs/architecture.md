# Architecture overview

Use npm workspaces and one committed lockfile. Shared TypeScript packages run in the frontend and Node MCP process. Vite builds the React UI; esbuild bundles workspace code into the Node server. Tauri 2 hosts the UI. Rust will handle narrowly scoped native filesystem/render operations through validated adapters. There is no native IPC command in BUILD 000.

| Boundary                | Responsibility                                          | BUILD 000                                 |
| ----------------------- | ------------------------------------------------------- | ----------------------------------------- |
| apps/desktop            | React UI and Tauri host                                 | Development window, shared status command |
| apps/mcp-server         | MCP protocol over stdio                                 | Status only                               |
| packages/project-format | Versioned project data and future validation/migrations | Draft types                               |
| packages/command-engine | Validated commands, future transactions/undo            | Pure status dispatcher                    |
| packages/agent-tools    | MCP schemas mapped to shared commands                   | Status adapter                            |
| packages/drawing-core   | Stroke geometry and brush evaluation                    | Reserved                                  |
| packages/animation-core | Transform interpolation, future rigs/cameras            | Reserved                                  |
| packages/timeline-core  | Frames and exposure evaluation                          | Reserved                                  |
| packages/render-core    | Scene evaluation and rendering contract                 | Reserved                                  |
| integrations/blender    | Optional future integration                             | Design boundary only                      |
| tests                   | Unit and protocol integration tests                     | Status and real stdio handshake           |

Both adapters use the same engine. The standalone server does not share live state with the desktop; that requires an explicit authenticated session bridge in a later build. Do not add a second project engine in the server. Pure packages must not depend on React, Tauri, or MCP. Keep project-format at the bottom of the dependency graph. Future engines consume it; command-engine orchestrates them; adapters call command-engine.

Local rendering and FFmpeg are future work. No hosted model, video generation service, or paid dependency is required. Director, Artist, and Co-Create modes eventually operate on the same editable data, not flattened AI videos.

## BUILD 001 drawing slice

The separate BUILD 001 branch depends on draft PR #1 and adds [validated project data](project-model.md), [shared commands/history](commands.md), SVG canvas input and isolated MCP drawing tools. The table above is the historical BUILD 000 baseline. Current responsibilities: project-format owns Zod schemas/types and limits; drawing-core owns stroke geometry; command-engine owns validated state/history; agent-tools and MCP only adapt that engine; React only collects gestures and renders snapshots. Zod is reused from the existing locked dependency family, with explicit package dependencies. Playwright is a development-only browser test tool.

See [BUILD 001 scope](build-001.md) and [validation](build-001-validation.md). The standalone MCP project remains separate from the desktop. No Rust IPC permissions, native operations or remote transport were added. Animation/timeline/render packages remain reserved.
