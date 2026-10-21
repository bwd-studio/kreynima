# KREYNIMA

An open-source 2D/2.5D animation application by BuildWithDani, inspired by Blender Grease Pencil. The goal is editable drawings, layers, keyframes, rigs, cameras, and films. ChatGPT and Claude are external AI collaborators; KREYNIMA does not host a language model.

Director Mode, Artist Mode, and Co-Create Mode are product goals. BUILD 000 provides a development window and a read-only MCP status server. It does not yet draw, animate, save projects, render films, or connect MCP to a live desktop session.

## Development

Install Node.js 22.12+ (Node 24 also supported), npm, and stable Rust via rustup. On Windows install Visual Studio C++ Build Tools with the Windows SDK and WebView2. On macOS install Xcode Command Line Tools. See [build instructions](docs/building.md).

```sh
npm ci
npm run check
npm run desktop
```

`npm run dev` serves only the React frontend at http://127.0.0.1:1420. `npm run desktop` launches the Tauri application. `npm run build` builds JavaScript; native compilation is separate.

```sh
npm run build
npm run mcp
```

The MCP process communicates through stdio; use a client to call `kreynima_status`. It writes no startup banner to stdout. See [MCP setup](docs/mcp.md).

## Documentation

- [Architecture](docs/architecture.md) and [project/drawing model](docs/project-model.md)
- [Commands](docs/commands.md), [security](SECURITY.md), and [roadmap](docs/roadmap.md)
- [Dependency policy](docs/licensing.md) and [validation record](docs/build-000-validation.md)
- [Contributing](CONTRIBUTING.md), [conduct](CODE_OF_CONDUCT.md), and [agent rules](AGENTS.md)

Code is GPL-3.0-only; see the unchanged [LICENSE](LICENSE), [NOTICE](NOTICE.md), [trademark policy](TRADEMARKS.md), and [brand asset policy](BRAND_ASSETS_LICENSE.md). Commercial forks are permitted under GPLv3. Brand policies need legal review before a public release.
