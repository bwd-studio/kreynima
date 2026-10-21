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

## Follow-up verification (2026-10-20, America/New_York)

Implementation under test: `3b1c9176df8206b0dcc83753f47d4f16d67d1c49` on the existing PR branch; subsequent changes to this record/build instructions are documentation only. No merge or BUILD 001 implementation was performed.

### Actions investigation

- The unfiltered repository Actions runs API returned `total_count: 0`, both before and after pushing `3b1c917`. This rules out the earlier PR-only wrapper's filter as the sole explanation.
- The commit check-runs API also returned zero checks. The combined commit status returned `pending` with **zero statuses**; that is absence of reporting, not a running or passing job.
- `.github/workflows/ci.yml` is present on the PR branch and has valid `push` and `pull_request` triggers without branch/path filters or draft exclusions. actionlint 1.7.7 passed before and after the changes. Draft status does not itself suppress these configured events. No syntax/trigger defect was found that explains zero runs.
- Public repository navigation omitted Actions and the unauthenticated Actions page returned 404. This is consistent with Actions being unavailable/disabled, but does not establish the repository/organization setting or exact cause.
- Actions enablement is **unconfirmed**. The connected GitHub fetch tool rejects `/actions/permissions` and `/actions/workflows` as unsupported endpoint families. The CLI settings request returned `Forbidden`. Available tools have no workflow enable/dispatch operation. No settings or organization policy were changed. Administrator confirmation of settings/approval/policy/runner availability is still required; do not infer that Actions is enabled from the presence of YAML.
- Added `workflow_dispatch` as a future recovery path, matrix `fail-fast: false`, job timeouts, locked CI-mode Tauri builds, a pinned cargo-deny version, full npm audit including development dependencies, and Rust advisory checks. Manual dispatch generally requires the workflow on the default branch; do not merge this PR to obtain it. A new branch push was sent successfully, but execution was not observed.

The maintainer subsequently reported the Actions issue fixed. A fresh push of `065ae5a65ffe752ed4c88db5d8b951e182b98d2f` then produced both [PR run 39533637206](https://github.com/bwd-studio/kreynima/actions/runs/39533637206) and [push run 39533636100](https://github.com/bwd-studio/kreynima/actions/runs/39533636100). The Actions page changed from 404 to 200. **Workflow availability and push/PR triggering are now confirmed**, superseding the earlier unconfirmed enablement/empty-run observations. The precise setting changed was not provided and is not independently asserted. Both target native jobs were created; job results are recorded below when available.

The first hosted Windows JavaScript job failed Prettier across the checkout while Linux/macOS JavaScript jobs passed. The checkout used Windows line endings; added `.gitattributes` to require LF for text while preserving binary icons. This fix requires confirmation by a fresh Windows run.

### Executed checks and results

| Check                                                                                                 | Confirmed result                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --cache /tmp/kreynima-npm-cache`                                                              | Pass, clean install on Linux with Node 24.19.0 / npm 11.9.0; ESLint 9 deprecation warning remains                                                                                      |
| `npm run check`                                                                                       | Pass on Node 24.19.0 and Node 22.23.3 (Linux): TypeScript, ESLint, Prettier, two expanded tests, MCP bundle, Vite production build, 100 installed production dependency license checks |
| `npm audit --audit-level=high`                                                                        | Pass; zero known advisories reported for installed JavaScript dependencies, including development dependencies                                                                         |
| `actionlint .github/workflows/ci.yml` (v1.7.7)                                                        | Pass; validates workflow syntax/expressions, not repository Actions settings or platform execution                                                                                     |
| `cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check`                                 | Pass with Rust 1.99.1                                                                                                                                                                  |
| `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml check licenses bans sources` (v0.20.2)  | Pass; duplicate-version and unused-license-allowance warnings                                                                                                                          |
| `cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml check advisories licenses bans sources` | **Fail**: RUSTSEC-2024-0370, unmaintained `proc-macro-error` 1.0.4 via Tauri's Linux `glib-macros`/GTK chain; no safe upgrade listed. Other categories pass. No ignore added.          |
| `cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml`                              | **Blocked/fail** on Linux: missing GLib/GObject/GIO system development libraries; cannot reach application compilation                                                                 |
| `cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml`                               | **Blocked/fail** for the same missing Linux prerequisites; no Rust test success claimed                                                                                                |
| `npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked`                            | Frontend build passes; **native build fails** on the same system-library prerequisites                                                                                                 |
| Windows/macOS hosted checks and native compilation                                                    | **Not run**: no workflow run exists; there is no Windows/macOS executor in this workspace                                                                                              |
| Windows/macOS interactive window smoke tests                                                          | **Not run**; minimal procedure is in [building.md](building.md#manual-native-window-smoke-test)                                                                                        |
| `git diff --check`; compare LICENSE to initial commit                                                 | Pass; no license text change                                                                                                                                                           |

The newly added advisory category explains why the previous licenses/bans/sources-only check passed while the full Rust review now fails. RUSTSEC-2024-0370 is a maintenance advisory, not a claim of a demonstrated exploit or GPL incompatibility. The unfiltered graph includes Linux dependencies even though release targets are Windows/macOS; the broad check remains enabled and failing until reviewed/resolved upstream. No dependency downgrades, unverified replacement forks, advisory ignores, or broader license allowances were introduced.

### Command/MCP and policy recheck

The built stdio process completes MCP initialization and advertises exactly `kreynima_status`; no resource or prompt capability is advertised. Its status equals the shared command dispatcher's status. Tests verify an unsupported engine command throws; MCP names `shell`, `python`, `exec`, `application.status` (not an MCP tool name), and `unknown` return tool errors. The status schema is now strictly empty and rejects injected `command`/`code` fields; status still succeeds after rejection. A 15-second integration-test timeout prevents an unbounded handshake wait.

Source review of the MCP server, agent tool, and command engine found one registered read-only tool, no dynamic tool registration, no process/shell/Python execution, no native filesystem handler, and only stdio transport. The license-check development script uses a fixed local npm command; it is not imported by or exposed through MCP. These bounded checks do not establish complete security or validate any ChatGPT/Claude client integration.

GPL dependency checks validate metadata against the existing policy; they do not replace distribution/source/notice review. LICENSE, TRADEMARKS.md, and BRAND_ASSETS_LICENSE.md remain unchanged in this follow-up. Commercial GPL forks remain allowed; no registration, legal clearance, or completed legal review is claimed.

### Acceptance assessment

| BUILD 000 criterion                                         | Status                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Development application launches in a supported environment | **Unmet/unverified**: no Windows/macOS native launch evidence                                              |
| Governance documents                                        | Present; legal review/reporting-contact gates remain documented                                            |
| MCP launches and is tested                                  | Met for the standalone status foundation on Linux, Node 22/24                                              |
| Architecture documented                                     | Met for BUILD 000 scope; future features remain explicitly unimplemented                                   |
| CI and local scripts exist                                  | Met for definitions; **hosted execution/enablement unconfirmed**                                           |
| Applicable tests/checks pass                                | Partially met: JavaScript and license checks pass; Rust advisory check fails and native checks are blocked |
| Remaining legal/technical blockers documented               | Met by this record and linked policies                                                                     |

**BUILD 000 does not yet meet all acceptance criteria.** No Windows/macOS compatibility, complete security, or release readiness is asserted. Stay on draft PR #1; do not merge or start BUILD 001.

## Remaining gates

1. Have a repository/organization administrator confirm or enable Actions and allowed action policies, obtain an actual triggered run, and inspect all Windows/macOS jobs. Resolve the full-graph Rust maintenance advisory or document an explicitly reviewed disposition without silently suppressing it. CI definitions alone do not verify compatibility. Fix any native/platform failures and manually launch the development window on both target systems.
2. Configure branch protection and CODEOWNERS review requirements as repository administrators choose. CODEOWNERS names verified administrator @BuildWithDani; enforcement is not configured by this PR.
3. Enable private vulnerability reporting or establish a verified contact, plus confidential conduct reporting and an independent appeals contact.
4. Obtain legal review of trademark rights/policy, asset policy, GPL-only interpretation, contribution terms, and distribution notices before release.
5. Plan signing, notarization, installers, reviewed application identifiers/icons, and complete third-party notices before distributing releases. The development icon is a GPL-covered solid-color square, not official brand artwork.

## Start BUILD 001

Close the native launch and CI gates, then implement runtime project validation, documented coordinates/frame/exposure rules, fixture-based round trips, validated project commands, and safe atomic native persistence. Do not add drawing or AI mutation tools before project invariants and project authority are tested. See roadmap.md for proposed BUILD 002–005 scopes.
