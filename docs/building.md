# Build and local checks

Use Node.js 22.12+ and npm with the committed package-lock.json. Install stable Rust through rustup. Windows requires MSVC C++ Build Tools, Windows SDK, and WebView2. macOS requires Xcode Command Line Tools. See Tauri's official v2 prerequisites for current versions: https://v2.tauri.app/start/prerequisites/ . Linux is a development fallback, not a target release platform, and needs WebKitGTK 4.1 and Tauri's Linux prerequisites.

```sh
npm ci
npm run check
npm run desktop
```

`npm run check` checks TypeScript, lint, formatting, tests, JavaScript builds, and a production JavaScript dependency license allowlist. `npm audit` reports dependency advisories; review them before release. Run `npm run format` for formatting.

```sh
cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
npm run tauri -w @kreynima/desktop -- build --no-bundle
```

Cargo.lock is committed. Use `--locked` for Rust dependency resolution and review intentional lockfile updates. CI runs Windows and macOS native compilation and Rust checks, plus JavaScript quality checks. A workflow definition is not evidence that CI passed; inspect actual run results. Manual native window launch still needs verification on both target platforms. No signing, notarization, installers, auto-updates, or release publishing is configured. Packaging requires verified brand identifiers, icons, signing identities, dependency notices, and source distribution review.

Rust license review: install cargo-deny locally or use CI's isolated dependency job, then run `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml check licenses bans sources`. Policy is conservative; review exceptions rather than expanding it blindly. FFmpeg and Blender are not bundled. No paid service is needed.
