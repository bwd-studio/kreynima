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
npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked
```

Cargo.lock is committed. Use `--locked` for Rust dependency resolution and review intentional lockfile updates. CI runs Windows and macOS native compilation and Rust checks, plus JavaScript quality checks. A workflow definition is not evidence that CI passed; inspect actual run results. Manual native window launch still needs verification on both target platforms. No signing, notarization, installers, auto-updates, or release publishing is configured. Packaging requires verified brand identifiers, icons, signing identities, dependency notices, and source distribution review.

Rust license review: install cargo-deny locally or use CI's isolated dependency job, then run `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml check advisories licenses bans sources`. Policy is conservative; review exceptions rather than expanding it blindly. FFmpeg and Blender are not bundled. No paid service is needed.

`tauri dev` and `tauri build` regenerate ACL/capability JSON under `apps/desktop/src-tauri/gen/`. Those files are ignored; do not commit them.

## macOS Command Line Tools and Xcode license

macOS compilation needs a working Apple C toolchain. If `xcode-select -p` points at `/Applications/Xcode.app/Contents/Developer` and the Xcode license has not been accepted, `clang` and `xcrun` exit 69 and print `Please run 'sudo xcodebuild -license'`. Accepting that license or changing the active developer directory requires administrator approval and must not be applied automatically.

When Xcode Command Line Tools are already installed at `/Library/Developer/CommandLineTools`, a session-only workaround is:

```sh
export DEVELOPER_DIR=/Library/Developer/CommandLineTools
```

Confirm `xcrun --sdk macosx --show-sdk-path` succeeds in that environment, then run the npm and cargo commands from the same shell. This does not accept the Xcode license and does not run `xcode-select -s`. The 2026-10-21 macOS Apple Silicon smoke test used this workaround; see [the validation record](build-000-validation.md#macos-interactive-smoke-test).

## Manual native window smoke test

For the short launch/window/close procedure and the results table, use [native-smoke-test.md](native-smoke-test.md).

A successful compile in a hosted runner does not confirm a visible, usable native window. BUILD 000 CI is configured to compile the application but does not exercise an interactive Windows/macOS desktop session. Perform this procedure on each target OS with an interactive logged-in user; record the exact commit, OS version, CPU architecture, Rust/Node versions, commands, exit status, and observed result in the validation record.

1. Check out `feat/build-000-foundation` at the PR's current commit. On Windows, install MSVC C++ Build Tools/Windows SDK and WebView2; on macOS, install Xcode Command Line Tools. Install stable Rust and Node 22.12+.
2. From the repository root, run `npm ci`, then `npm run check`. Close any Vite server already using port 1420.
3. Run `npm run desktop`. Confirm a native window titled **KREYNIMA — Development** appears with KREYNIMA, BUILD 000, development status, and the message that no project is open. Resize the window, minimize/restore it, and confirm text remains readable. Record any blank screen or console error. Do not treat the browser-only `npm run dev` page as a native launch.
4. Close the window and stop the development watcher with Ctrl+C if it remains running. Re-run and confirm the window opens again without a crash.
5. Run `npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked`. Launch `apps\desktop\src-tauri\target\release\kreynima-desktop.exe` on Windows (PowerShell: `& .\apps\desktop\src-tauri\target\release\kreynima-desktop.exe`), or `./apps/desktop/src-tauri/target/release/kreynima-desktop` on macOS. Confirm the same content appears without a Vite server, then close it normally. This is an unsigned local build, not an installer or notarized release.
6. Run `npm test` to exercise the built stdio MCP process, status parity, and rejection tests. If a supported MCP client is available, optionally connect using docs/mcp.md and call only `kreynima_status`; record that client/version separately.

A passing smoke test confirms only the observed window/session and architecture. It does not establish all Windows/macOS versions, accessibility, complete security, signing, release readiness, or future animation features. Both target OS results remain required by this PR's validation gates; macOS Intel/Apple Silicon and Windows ARM coverage must be identified explicitly rather than inferred from `*-latest` runners.

## Actions troubleshooting

The workflow runs on `push` and `pull_request`; draft PRs are not excluded. `workflow_dispatch` is also defined for later manual use. GitHub normally requires the workflow file on the default branch before it appears as manually dispatchable; BUILD 000 must not be merged merely to obtain that button. A new push to the existing PR branch is the immediate trigger.

If no run is created, a maintainer must inspect Settings → Actions → General at repository and organization levels, permitted action policies, the Actions tab for approval/disabled-workflow messages, and hosted-runner availability/billing messages. Confirm that checkout/setup-node and dtolnay/rust-toolchain are permitted. Use a human/PAT or GitHub App push if a restricted GITHUB_TOKEN event was suppressed; do not broaden the workflow's read-only token permissions to address event suppression. An empty run list alone does not distinguish these causes. Do not switch to pull_request_target to obtain secrets or execute PR code with elevated permissions.

Diagnostic reads: `gh api repos/bwd-studio/kreynima/actions/permissions`, `gh api repos/bwd-studio/kreynima/actions/workflows`, and `gh api 'repos/bwd-studio/kreynima/actions/runs?per_page=20'`. These require appropriate access; the connected tools in the current cloud session cannot read settings or dispatch new workflows. Once enabled, push a reviewed commit or re-run an existing run, then record links and the platform/architecture of every job. Never interpret absent jobs as passing.
