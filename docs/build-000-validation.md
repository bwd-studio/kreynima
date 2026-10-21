# BUILD 000 validation and open gates

**BUILD 000 is not yet complete.** Native compilation and JavaScript/MCP checks have passed on hosted target runners, but interactive native window launches remain unverified and the full Rust dependency review fails on an upstream maintenance advisory. No merge or BUILD 001 work was performed.

This record was updated on 2026-10-20 (America/New_York); GitHub logs use UTC. The tested branch is `feat/build-000-foundation`, draft PR [#1](https://github.com/bwd-studio/kreynima/pull/1). Application/MCP implementation is at `3b1c9176df8206b0dcc83753f47d4f16d67d1c49`; commit `065ae5a` changed documentation, and `4543eb15b32b8e290eddc03c15a407ed07a2492e` added LF checkout rules plus documentation. The final evidence update is documentation only; it does not change the tested program or workflow.

## Repository preservation

Base commit: `5092400f47fba3cd727afad7eefd08a651c796c1` (initial commit). The original README.md, LICENSE, and .gitignore were inspected with a clean working tree. Origin remains https://github.com/bwd-studio/kreynima.git . History, GPL license text, and existing ignore rules are preserved. No trademark/brand-policy text, package versions, or dependency lockfiles were changed in this follow-up.

## Actions investigation and fixes

Before the maintainer's intervention, the unfiltered repository runs API returned `total_count: 0`; commit check-runs also returned zero. Combined commit status was `pending` with zero statuses, which was absence of reporting, not an active job. This ruled out the earlier PR-only wrapper's filter as the sole explanation. The public Actions page returned 404 and repository navigation omitted Actions.

The workflow already had valid `push` and `pull_request` triggers without branch/path filters or draft exclusions. actionlint 1.7.7 passed; no syntax defect explained the missing runs. A draft PR is not excluded by those events. Settings could not be read: the connected tool rejects `/actions/permissions` and `/actions/workflows`, and the CLI request returned `Forbidden`. The exact repository/organization setting was therefore not independently established or changed by this agent.

The maintainer reported the issue fixed. A fresh push of `065ae5a` created both [PR run 39533637206](https://github.com/bwd-studio/kreynima/actions/runs/39533637206) and [push run 39533636100](https://github.com/bwd-studio/kreynima/actions/runs/39533636100); the public Actions page returned 200. **Workflow availability and push/PR triggering are now confirmed.** The precise setting changed was not supplied; there is no claim of a specific billing, approval, or organization-policy cause.

The first Windows JavaScript job failed Prettier on 50 files because the checkout used CRLF. `.gitattributes` now requires LF text checkouts and preserves binary icons. Fresh Windows jobs on `4543eb1` passed formatting and all subsequent JavaScript checks, confirming the fix.

Other CI improvements: manual `workflow_dispatch` for future recovery, matrix `fail-fast: false`, bounded job times, locked CI-mode Tauri builds, cargo-deny pinned to 0.20.2, npm audit including development dependencies, and Rust advisory checks. Read-only workflow permissions remain. Manual dispatch generally requires the workflow on the default branch; it was not used, and this PR was not merged to obtain it. See [Actions troubleshooting](building.md#actions-troubleshooting).

## Confirmed hosted results

Runs on `4543eb1`: [push 39533955043](https://github.com/bwd-studio/kreynima/actions/runs/39533955043), [PR 39533960504](https://github.com/bwd-studio/kreynima/actions/runs/39533960504). Equivalent push/PR runs may finish at different times; job evidence below identifies what actually completed. A later documentation-only push can create another run without invalidating these source checks; its result must not be assumed.

| Check                  | Evidence and result                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows JavaScript     | **Pass**, [job 119006121124](https://github.com/bwd-studio/kreynima/actions/runs/39533955043/job/119006121124), `4543eb1`; also passed in PR job 119006140232                                                                                |
| macOS JavaScript       | **Pass**, [job 119006121137](https://github.com/bwd-studio/kreynima/actions/runs/39533955043/job/119006121137), `4543eb1`; also passed in PR job 119006140054                                                                                |
| Linux JavaScript       | **Pass**, [job 119006121206](https://github.com/bwd-studio/kreynima/actions/runs/39533955043/job/119006121206), `4543eb1`; also passed in PR job 119006140279                                                                                |
| macOS native           | **Pass**, [job 119006121079](https://github.com/bwd-studio/kreynima/actions/runs/39533955043/job/119006121079), `4543eb1`; macOS 26.6.2, Apple Silicon (`aarch64-apple-darwin`), Rust 1.99.1                                                 |
| Windows native         | **Pass**, [job 119006121066](https://github.com/bwd-studio/kreynima/actions/runs/39533955043/job/119006121066), `4543eb1`; Windows Server 2025 x64 (`x86_64-pc-windows-msvc`), Rust 1.99.1. Also passed on `065ae5a` in PR job 119005092699. |
| Rust dependency review | **Fail**, [job 119005092524](https://github.com/bwd-studio/kreynima/actions/runs/39533637206/job/119005092524), repeated on `4543eb1`: RUSTSEC-2024-0370; no advisory ignore added                                                           |

Each JavaScript job ran `npm ci`, `npm run check`, and `npm audit --audit-level=high`. Checks cover TypeScript, ESLint, Prettier, two behavior/protocol tests, the MCP bundle, the React production build, and licenses of 100 installed production dependencies. The audit reported zero known JavaScript vulnerabilities including development dependencies. ESLint 9 deprecation and actions/checkout/setup-node v4 runtime deprecation warnings remain; neither was a failing check.

Each successful native job ran `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, and `npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked`. The Rust harness ran **zero Rust tests**, so cargo-test success establishes compilation/harness execution only. Behavior tests live in the JavaScript suite. Tauri produced `kreynima-desktop.exe` on Windows and `kreynima-desktop` on macOS. Installers, signing, notarization, visible windows, macOS Intel, and Windows ARM were not tested.

All six jobs in push run 39533955043 completed: five platform jobs passed and the Rust dependency job failed. The overall workflow remains failing because of the Rust maintenance advisory, even where platform jobs pass. Compilation is not a claim of general Windows/macOS compatibility or release readiness.

## Local checks and limitations

| Check                                                                 | Result in Linux cloud workspace                                                                                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean `npm ci`; `npm run check`                                       | **Pass**, Node 24.19.0 / npm 11.9.0; checks repeated under Node 22.23.3, matching CI's Node major                                                                                                 |
| `npm audit --audit-level=high`                                        | **Pass**, zero known JavaScript advisories at verification time                                                                                                                                   |
| actionlint 1.7.7                                                      | **Pass**, workflow syntax/expressions; not a settings or runtime test                                                                                                                             |
| `cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check` | **Pass**, Rust 1.99.1                                                                                                                                                                             |
| `cargo deny ... check licenses bans sources`                          | **Pass**, cargo-deny 0.20.2; duplicate-version and unused-license-allowance warnings                                                                                                              |
| `cargo deny ... check advisories licenses bans sources`               | **Fail**, same RUSTSEC-2024-0370 as CI; other categories pass                                                                                                                                     |
| `cargo check --locked`, `cargo test --locked`, Tauri native build     | **Blocked/fail locally**, missing GLib/GObject/GIO system development libraries. Linux GTK/WebKitGTK prerequisites are absent. Hosted target successes above do not make these Linux checks pass. |
| Development HTTP server                                               | Vite launched and served its entry page. Earlier Chromium headless attempts produced no rendered DOM; visual rendering remains unverified locally.                                                |
| `git diff --check`; LICENSE compared with initial commit              | **Pass**; license text unchanged                                                                                                                                                                  |

Some child-process/network checks required the environment's network/process access to be enabled and a writable npm cache under `/tmp`. No application permissions were broadened for those checks. Rust was installed in temporary directories. Dependency versions were resolved into the existing committed lockfiles in the original BUILD 000 implementation; this follow-up did not change them.

## Shared engine, MCP, and dependency review

The built stdio server initializes and advertises exactly `kreynima_status`, with no resource/prompt capability. Its result equals the shared dispatcher status. Tests verify an unknown engine command throws; MCP tool names `shell`, `python`, `exec`, `application.status` (not a tool name), and `unknown` return errors. The status schema is now strictly empty and rejects injected `command`/`code` arguments. Status still works after rejection. The integration test has a 15-second timeout.

Source review found one read-only tool registration and only stdio transport, with no dynamic tool loading, process/shell/Python execution, or filesystem handler in the server/agent-tool/command-engine boundaries. The fixed local npm command in the development license script is not exposed through MCP. These bounded checks do not establish complete security or ChatGPT/Claude client compatibility. Live desktop-session control is not implemented.

RUSTSEC-2024-0370 concerns unmaintained `proc-macro-error` 1.0.4 through Tauri's Linux `glib-macros`/GTK dependency chain. No safe upgrade is listed. The unfiltered graph includes Linux even though release targets are Windows/macOS; the broad advisory check stays enabled and failing. No downgrade, replacement fork, advisory suppression, or broader license allowance was introduced. This maintenance advisory is distinct from a demonstrated exploit and from a GPL incompatibility.

GPL license/source/ban metadata checks pass, but complete corresponding-source and notice review is still required before binary distribution. LICENSE, TRADEMARKS.md, and BRAND_ASSETS_LICENSE.md remain unchanged in this follow-up. Commercial GPL forks remain permitted. No trademark registration, clearance, or completed legal review is asserted.

## Advisory follow-up and CI for `16aa2d7`

The [complete advisory investigation](dependencies/RUSTSEC-2024-0370.md) records both introducing crates (`glib-macros` and `gtk3-macros`), registry constraints, supported upgrade checks, target scope, actual maintenance risk, and recommended upstream resolution. `cargo update --dry-run` proposed zero compatible updates and did not change Cargo.lock. Newer GTK 0.19 / GLib 0.22 macro stacks remove the affected dependency but do not satisfy the current Tauri/Wry GTK `^0.18` requirements. The `proc-macro-error2` fork is archived; recently published `manyhow` and `proc-macro2-diagnostics` are upstream migration candidates, not drop-in replacements for the existing consumers. No supported dependency change was identified to apply safely.

Local inverse-tree checks confirm `proc-macro-error` 1.0.4 is present in the all-target Linux/BSD toolkit graph and absent from the resolved Windows x64, macOS Apple Silicon, and macOS Intel target trees. This is dependency resolution evidence, not compilation or launch evidence for untested architectures. The advisory is informational/unmaintained with no patched versions; it does not identify a specific exploitable bug. Build-host maintenance/supply-chain risk remains, so the all-target advisory check is retained and failing. No patch, advisory ignore, target-filter suppression, manifest change, or lockfile update was made.

CI on the requested exact commit `16aa2d75ba09440852296eab723d0dcedaf748a0`:

| Job                | Push run [39534952582](https://github.com/bwd-studio/kreynima/actions/runs/39534952582)                 | PR run [39534957672](https://github.com/bwd-studio/kreynima/actions/runs/39534957672) |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| JavaScript Windows | Pass ([119009339371](https://github.com/bwd-studio/kreynima/actions/runs/39534952582/job/119009339371)) | Pass (119009355351)                                                                   |
| JavaScript macOS   | Pass (119009339514)                                                                                     | Pass (119009355433)                                                                   |
| JavaScript Linux   | Pass (119009339604)                                                                                     | Pass (119009355460)                                                                   |
| Native macOS       | Pass ([119009339584](https://github.com/bwd-studio/kreynima/actions/runs/39534952582/job/119009339584)) | Pass (119009355245)                                                                   |
| Native Windows     | Pass ([119009339976](https://github.com/bwd-studio/kreynima/actions/runs/39534952582/job/119009339976)) | Pass (119009355434)                                                                   |
| Rust dependencies  | Fail: RUSTSEC-2024-0370 (119009339497)                                                                  | Fail: same advisory (119009355422)                                                    |

Both push and PR runs completed and confirm all five platform jobs passed on `16aa2d7`; both full workflows fail on the Rust maintenance advisory. Native logs confirm Windows Server 2025 x64 / `x86_64-pc-windows-msvc` and macOS Apple Silicon / `aarch64-apple-darwin`, with built executable paths. Each native test harness ran zero Rust tests; substantive status/MCP tests are the two JavaScript tests. JavaScript jobs include type checking, lint/format, tests, builds, license checks, and npm audit. The final evidence commit after `16aa2d7` is documentation only; its new runs are separate and must not be assumed complete.

Rechecked locally for this documentation follow-up: `npm run check` passed, inverse target trees and registry/update checks completed, and `cargo deny ... check advisories licenses bans sources` failed only on the advisory while the remaining categories passed. No Rust/application code changed, so target native jobs above are the relevant compiled-source evidence; Linux native compilation remains blocked by missing system prerequisites as previously recorded.

A [short native smoke-test checklist](native-smoke-test.md) now supplies Windows PowerShell and macOS Terminal commands: launch, verify the development window, inspect startup errors, close, and reopen; repeat against the built executable without Vite. Both manual OS results remain explicitly **Not run**. No GUI launch was observed by this agent.

The draft is ready for maintainer review of the foundation and documented dependency disposition. BUILD 000 acceptance remains incomplete and the PR must stay draft: resolve/review the advisory explicitly and obtain the recorded Windows/macOS native launch evidence. No merge or BUILD 001 work was performed.

## Acceptance gates

| BUILD 000 criterion                                 | Assessment                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Development app launches in a supported environment | **Unverified**. Hosted native compilation passed; no interactive Windows/macOS launch has been observed.                   |
| Governance documents and architecture               | Present for BUILD 000 scope; legal review/reporting-contact gates remain documented.                                       |
| MCP launches and is tested                          | **Met** for the standalone status foundation, including hosted Windows/macOS/Linux tests.                                  |
| CI and local scripts                                | **Met**. Push/PR triggering and target jobs are confirmed. The full workflow has an advisory failure.                      |
| Applicable checks pass                              | **Partially met**. JavaScript and target compilation pass; the Rust advisory check fails; Linux native checks are blocked. |
| Blockers documented                                 | **Met** by this record and linked policies.                                                                                |

Before calling BUILD 000 complete:

1. Resolve the Rust maintenance advisory upstream or establish an explicitly reviewed disposition without silently hiding it.
2. Perform and record the [minimal native smoke test](building.md#manual-native-window-smoke-test) on interactive Windows and macOS systems: development and built executable launch, readable content, resize/minimize/restore, clean close and relaunch. CI did not exercise visible desktop sessions. Record commit, OS, architecture, tool versions, and result; do not infer untested architectures.
3. Establish verified confidential security/conduct contacts and review repository enforcement settings. Obtain legal review of trademark/brand policies, GPL-only interpretation, contribution terms, and distribution obligations before release.
4. Before distributing releases, separately plan reviewed identifiers/icons, installers, signing/notarization, and complete third-party notices/corresponding source. Those release tasks are not claimed complete by BUILD 000.

Stay on draft PR #1. Do not merge or begin BUILD 001 until authorized; its proposed roadmap remains documentation only.
