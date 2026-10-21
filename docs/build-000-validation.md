# BUILD 000 validation and open gates

Status: foundation implemented; BUILD 000 acceptance remains pending native window launch on a supported target OS. This record describes the Linux cloud workspace checks, not Windows/macOS certification.

## Inspection and preservation

Base commit: `5092400f47fba3cd727afad7eefd08a651c796c1` (initial commit). Existing files were README.md, LICENSE, and .gitignore. The working tree was clean. Origin points to https://github.com/bwd-studio/kreynima.git . Existing history and LICENSE are unchanged; existing ignore rules are retained. Work is on `feat/build-000-foundation`.

## Executed checks

- Node 24.19.0 / npm 11.9.0: dependency install and clean `npm ci` succeeded using a writable temporary cache.
- `npm run check`: TypeScript, ESLint, Prettier, two tests, MCP bundle, React production build, and 100 installed production dependency license checks passed.
- MCP integration launches the built server with Node, completes initialization, lists only status, compares its result with the shared dispatcher, and rejects an unknown tool. Dispatcher test checks deterministic status and unknown-command rejection.
- `npm audit --audit-level=high`: zero reported vulnerabilities, including development dependencies, at verification time. This is not a guarantee against undiscovered vulnerabilities.
- Vite development server launched on 127.0.0.1:1420; HTTP returned the development entry page. Chromium headless attempts did not produce a rendered DOM in this container; visual rendering is unverified.
- Rust stable 1.99.1 installed in temporary directories; Cargo.lock generated and committed. `cargo fmt --check` passed.
- `cargo check --locked`, `cargo test --locked`, and Tauri `build --no-bundle` were attempted. All native compilation is blocked by missing system GLib (`glib-2.0.pc`); GTK/WebKitGTK prerequisites are also absent. No native window was launched.
- `cargo deny check licenses bans sources`: passed with duplicate-version warnings. License allowlist includes the program's GPL-3.0-only license; dependency metadata review is not legal clearance.
- `git diff --check` and unchanged LICENSE verification passed.

The sandbox's default process/network restrictions prevented some child-process tests; successful checks ran with the environment's network/process access enabled. No application network or native privileges were added to make tests pass.

## Remaining gates

1. Run the committed GitHub Actions on Windows/macOS and inspect results. CI definitions alone do not verify compatibility. Fix any native/platform failures and manually launch the development window on both target systems.
2. Configure branch protection and CODEOWNERS review requirements as repository administrators choose. CODEOWNERS names verified administrator @BuildWithDani; enforcement is not configured by this PR.
3. Enable private vulnerability reporting or establish a verified contact, plus confidential conduct reporting and an independent appeals contact.
4. Obtain legal review of trademark rights/policy, asset policy, GPL-only interpretation, contribution terms, and distribution notices before release.
5. Plan signing, notarization, installers, reviewed application identifiers/icons, and complete third-party notices before distributing releases. The development icon is a GPL-covered solid-color square, not official brand artwork.

## Start BUILD 001

Close the native launch and CI gates, then implement runtime project validation, documented coordinates/frame/exposure rules, fixture-based round trips, validated project commands, and safe atomic native persistence. Do not add drawing or AI mutation tools before project invariants and project authority are tested. See roadmap.md for proposed BUILD 002–005 scopes.
