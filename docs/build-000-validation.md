# BUILD 000 validation and open gates

**BUILD 000 remains draft and is not declared complete.** Windows 11 Pro x64 and macOS Apple Silicon interactive smoke tests are recorded below, and hosted platform jobs passed on `735224e`. The final security-gate mechanism is implemented but disabled for maintainer review. Accepted risks: **none**. The full Rust advisory finding remains visible and the gate remains blocking until explicit valid approval or supported remediation. No merge or BUILD 001 work was performed.

This record was updated on 2026-10-21 (America/New_York); GitHub logs use UTC. The tested branch is `feat/build-000-foundation`, draft PR [#1](https://github.com/bwd-studio/kreynima/pull/1). Application/MCP implementation is at `3b1c9176df8206b0dcc83753f47d4f16d67d1c49`; commit `065ae5a` changed documentation, and `4543eb15b32b8e290eddc03c15a407ed07a2492e` added LF checkout rules plus documentation. The macOS smoke test used program commit `089503e6e0776dafaf23d07c4ed18aac3c66997a`. The Windows smoke test used program commit `ddd23b0a6f847c7d4bec3234782ebb05a4b1b257`; `git diff --stat 089503e..ddd23b0 -- apps packages` was empty, so the desktop program matches the macOS-tested tree. This evidence update is documentation only; it does not change the tested program, workflow, or Rust advisory checks.

## Final security-gate implementation (2026-10-21)

Verified commit `735224e333d66364d9ee213284dc46d77b027e94` and both completed runs: [push 39618940500](https://github.com/bwd-studio/kreynima/actions/runs/39618940500) and [PR 39618950335](https://github.com/bwd-studio/kreynima/actions/runs/39618950335).

| Check at `735224e`         | Push / PR result                                             |
| -------------------------- | ------------------------------------------------------------ |
| JavaScript Linux           | Pass / Pass (119286873357 / 119286905388)                    |
| JavaScript macOS           | Pass / Pass (119286873813 / 119286905279)                    |
| JavaScript Windows         | Pass / Pass (119286873992 / 119286905572)                    |
| Native macOS Apple Silicon | Pass / Pass (119286874280 / 119286905291)                    |
| Native Windows x64         | Pass / Pass (119286873801 / 119286905462)                    |
| Rust dependency review     | Fail / Fail (119286873655 / 119286905435): RUSTSEC-2024-0370 |

These are baseline CI results for the exact requested commit, not results of the later mechanism implementation. The Windows/macOS interactive evidence recorded by the platform sessions is retained; this Linux cloud session did not perform those GUI launches. Passing compilation alone is not substituted for that evidence.

### Implemented but inactive

[Gate operation, exact activation, and rollback](dependencies/rust-advisory-gate.md) describe the implementation. It captures the full unfiltered all-target cargo-deny 0.20.2 advisory report, real scanner exit status, and dependency-state evidence; independently runs blocking license/source/ban checks; adjudicates only the exact candidate; and uploads raw evidence/decision even on failure. Raw logs, an Actions warning and job summary keep the finding visible. No Cargo ignore, target filter, severity downgrade, blanket continue-on-error, or weakening of other build/security jobs was introduced.

`security/rust-advisory-exception.json` is **false**. No approval variable was set by this task. Activation requires a separately reviewed switch change and an administrator-verified approval record in `KREYNIMA_RUSTSEC_2024_0370_APPROVAL`. Until both controls and all scope/date guards pass, the job remains blocked. No risk acceptance or merge permission is inferred from implementation approval.

The hard expiry is executable policy: **2026-11-20T22:00:00.000Z (November 20, 2026, 5 PM America/New_York)**, inclusive. Dependency/workflow state, reported graph, and advisory metadata/solution changes invalidate eligibility. Interim review at **2026-11-04T22:00:00.000Z** is enforced. Malformed reports, scanner failures, unrelated/new findings (including warnings), missing expected findings with an armed exception, invalid/future approval, and stale/expired acceptance fail closed. Every fresh gate execution evaluates runner time; historical green GitHub statuses do not self-revoke, so fresh pre-merge checks remain mandatory.

### Local implementation verification

- `npm run check`: passes with **15 tests** on Node 22.23.3 (2 command/MCP tests and 13 security-gate tests), TypeScript, lint/format, JavaScript builds, and 100-package production license checks. Tests use synthetic approval only; no production switch or variable is enabled.
- Tests prove unrelated/same-package-new advisories, extra warnings, exact expiry boundary, overdue review, altered state/graph/advisory metadata, malformed/truncated reports, scanner errors, and invalid approval remain blocking. A temporary Git fixture verifies actual lockfile edits and new tracked manifests change the state fingerprint.
- Live unfiltered local capture: scanner exits **1**, preserves RUSTSEC-2024-0370. Actual disabled CLI gate exits **1**, records `accepted: false`, `exceptionUsed: false`, and reason “Exception disabled or maintainer approval missing.” No synthetic approval was used for this live check.
- Independent `cargo deny ... check licenses bans sources`: passes with existing duplicate-version/unused-allowance warnings. `cargo fmt --check` passes. `npm audit --audit-level=high`: zero known vulnerabilities reported. actionlint 1.7.7 and diff checks pass.
- No native application/Rust source, dependency version, lockfile, GPL license, trademark, or brand policy changed in this implementation. New hosted runs are required to verify workflow/artifact integration; their results are separate from baseline `735224e`.

### Hosted verification of the disabled implementation

Initial implementation `70b6d96` and hardened implementation `e17bb6fbc7a3423cf3f49231c0f3ee6c74466cbe` were pushed without enabling the control or setting an approval variable. On [hardened push run 39628082914](https://github.com/bwd-studio/kreynima/actions/runs/39628082914):

| Check                                  | Observed result                                                                                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript Linux / Windows / macOS     | **Pass**, jobs 119318597437 / 119318597467 / 119318597609; includes all 15 tests                                                                                                                                       |
| Full unfiltered advisory capture       | **Captured successfully**, actual scanner finding and nonzero exit retained; this step is not a scan pass                                                                                                              |
| Independent license, ban, source check | **Pass**, in job 119318597131                                                                                                                                                                                          |
| Companion advisory gate                | **Blocked as required**, finding count 1, acceptance applied **NO**, “Exception disabled or maintainer approval missing”                                                                                               |
| Raw evidence upload after gate failure | **Pass**, six report files uploaded as [artifact 12357622862](https://github.com/bwd-studio/kreynima/actions/runs/39628082914/artifacts/12357622862); 16,470 bytes; metadata confirms not expired and 90-day retention |
| Native reruns on this implementation   | macOS was running and Windows was queued at this observation. No native/Rust/application source changed; both baseline native jobs at `735224e` passed. These reruns are not claimed passed until complete.            |

The live hosted gate validated the report and exact state before blocking for absent approval, rather than failing due to parser/scope drift. Its log and summary retain RUSTSEC-2024-0370 and the hard expiry/review dates. Artifact ZIP digest reported by GitHub: `73e4c6d46de4f82fd44c059e87f36edc732d4fa158e57f7154263052a41ed08a`. Uploaded evidence was confirmed through the job log and artifact metadata; no activated production acceptance was exercised. Positive acceptance is tested only with synthetic records in unit tests.

The hardened state fingerprint includes gate scripts and security tests/fixtures as well as program/configuration/dependency files. A later accepted decision retains validated public approver/review metadata for audit. The final validation update is documentation only and will have separate CI runs; it does not activate the gate or change the tested policy code.

### Remaining approval requirements

The maintainer must review and explicitly approve both the [scoped residual-risk terms](dependencies/RUSTSEC-2024-0370-risk-acceptance-proposal.md) and this concrete implementation/activation plan, verify actual approval author/permalinks and scope digest, and authorize any activation separately. The unfiltered finding must remain recorded as a finding after activation; a companion gate pass means accepted risk, not remediation. Review the recorded native smoke-test evidence and all other required checks/governance gates. Leaving draft, merging, public release, and BUILD 001 each remain separate decisions not authorized by this task. Outstanding legal/distribution/reporting-contact requirements are not waived.

## Final release-gate preparation: `585e8bc`

Checked on 2026-10-21 against exact commit `585e8bcb37141d0b7054616c0cacd9d4b022fe60`. The macOS smoke-test evidence added by that commit is preserved below; this Linux cloud session did not reperform that interactive test. Windows interactive development and built-executable tests were later recorded against `ddd23b0` as documented in [Windows interactive smoke test](#windows-interactive-smoke-test).

[Push run 39573790976](https://github.com/bwd-studio/kreynima/actions/runs/39573790976) completed all six jobs:

| Check                      | Actual result at `585e8bc`                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript Linux           | **Pass**, job 119134174983                                                                                                                                          |
| JavaScript macOS           | **Pass**, job 119134175275                                                                                                                                          |
| JavaScript Windows         | **Pass**, job 119134175294                                                                                                                                          |
| Native Windows x64         | **Pass**, [job 119134175251](https://github.com/bwd-studio/kreynima/actions/runs/39573790976/job/119134175251)                                                      |
| Native macOS Apple Silicon | **Pass**, [job 119134175271](https://github.com/bwd-studio/kreynima/actions/runs/39573790976/job/119134175271)                                                      |
| Rust dependencies          | **Fail**, [job 119134175434](https://github.com/bwd-studio/kreynima/actions/runs/39573790976/job/119134175434): RUSTSEC-2024-0370; bans, licenses, and sources pass |

The [PR run 39573799015](https://github.com/bwd-studio/kreynima/actions/runs/39573799015) also completed: all JavaScript jobs and both native jobs passed (Windows job 119134203599; macOS job 119134203248). Its Rust job 119134204251 failed on the same advisory. Both runs therefore confirm the five platform checks for the exact requested commit while remaining failed overall on the Rust advisory.

The JavaScript jobs include TypeScript, ESLint, formatting, two command/MCP tests, JavaScript builds, production license checks, and npm audit. Native jobs include Rust formatting/checking, the zero-test Rust harness, and a locked Tauri executable build. Those results do not establish a visible Windows window launch. New documentation-only commits have separate runs whose outcomes must not be inferred from these results.

### Risk disposition: proposed, not accepted

The [existing investigation](dependencies/RUSTSEC-2024-0370.md) was reviewed. The narrowly scoped [risk-acceptance proposal](dependencies/RUSTSEC-2024-0370-risk-acceptance-proposal.md) covers only RUSTSEC-2024-0370 / `proc-macro-error` 1.0.4 in the exact locked Linux/BSD toolkit chain retained in the BUILD 000 Windows/macOS development inventory. It requires explicit owner approval, an interim review by **2026-11-04 at 17:00 America/New_York**, and hard expiry **2026-11-20 at 17:00 America/New_York**; changed dependencies, advisory classification, scope, or remediation availability trigger immediate reassessment/suspension.

**Accepted risks: none recorded.** The user requested proposal preparation, not approval. No Cargo ignore, target filter, check waiver, dependency change, lockfile change, workflow relaxation, or branch-protection change was made. The full raw advisory check remains enabled and failing; risk approval would not turn it into a passed test. If a later scoped gate is requested, the proposal requires separate reviewed code preserving raw all-target findings, exact ID/version/state/date guards, independent license/source/ban gates, and tests that unrelated/expired findings fail. No such gate exists in this update.

### Outstanding requirements and explicit maintainer decisions

Before merge, the maintainer must separately:

1. Approve the exact proposed temporary risk terms and ownership with timestamp/permalink, or require a supported dependency fix. Decide explicitly how any still-failing required advisory check is handled under repository policy; this document authorizes no bypass or silent suppression.
2. Review the recorded **Windows interactive** smoke-test evidence at `ddd23b0` and the macOS Apple Silicon evidence at `089503e`, including visible content, startup errors, clean close and relaunch. Compilation alone cannot satisfy this requirement. Windows ARM and macOS Intel remain untested.
3. Review all other required checks and applicable governance/security gates; acknowledge outstanding legal/distribution requirements before any release. This single-advisory proposal waives none of them.
4. Explicitly authorize taking PR #1 out of draft and merging after the applicable gates are satisfied. Neither is authorized by this preparation task. BUILD 001 remains out of scope.

`npm run check` passed locally for this documentation update (two tests, builds, type/lint/format, 100-package production license checks). Existing source/license/advisory/build check configuration is unchanged. **BUILD 000 remains incomplete and PR #1 remains draft.**

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

A [short native smoke-test checklist](native-smoke-test.md) supplies Windows PowerShell and macOS Terminal commands: launch, verify the development window, inspect startup errors, close, and reopen; repeat against the built executable without Vite. The macOS Apple Silicon interactive result is recorded below. The Windows 11 Pro x64 interactive result is recorded in [Windows interactive smoke test](#windows-interactive-smoke-test).

The draft is ready for maintainer review of the foundation and documented dependency disposition. BUILD 000 acceptance remains incomplete and the PR must stay draft: resolve/review the advisory explicitly. Interactive Windows and macOS Apple Silicon native launch evidence is now recorded. No merge or BUILD 001 work was performed.

## macOS interactive smoke test

Recorded on 2026-10-21 (America/New_York) against `feat/build-000-foundation` commit `089503e6e0776dafaf23d07c4ed18aac3c66997a`. This is an interactive desktop session on one Mac, not a hosted runner compile.

| Item              | Observed value                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS / architecture | macOS 27.0.1 (build 26A434), arm64 (`aarch64-apple-darwin`)                                                                                                                                             |
| Node / npm        | v22.13.1 / 10.9.2                                                                                                                                                                                       |
| Rust              | rustc 1.99.1 (58cf8f9c3 2026-10-13), cargo 1.99.1; stable rustup toolchain installed for this session because Rust was previously missing                                                               |
| Apple toolchain   | Xcode 27.1 selected at `/Applications/Xcode.app/Contents/Developer`; Xcode license unaccepted (`clang`/`xcrun` exit 69). Xcode Command Line Tools 27.0.0 and Apple clang 21.0.0 were already installed. |
| Workaround        | Session-only `export DEVELOPER_DIR=/Library/Developer/CommandLineTools`. The system `xcode-select` setting was not changed and `sudo xcodebuild -license` was not run.                                  |
| Tester            | Cursor agent on the maintainer Mac                                                                                                                                                                      |

Commands, from the repository root, with `DEVELOPER_DIR=/Library/Developer/CommandLineTools` and `$HOME/.cargo/env` sourced:

```sh
npm ci
npm run check
npm run desktop
npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked
./apps/desktop/src-tauri/target/release/kreynima-desktop
```

Port 1420 was free before each launch. `npm ci` completed with 0 known JavaScript vulnerabilities. `npm run check` passed: TypeScript, ESLint, Prettier, two JavaScript/MCP tests, the MCP and desktop JavaScript builds, and the production license allowlist.

| Check                                  | Result                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development launch (`npm run desktop`) | **Pass**. Cargo finished the `dev` profile in 49.28s and ran `target/debug/kreynima-desktop`. A native macOS window owned by `kreynima-desktop` opened; the window was not a browser tab. Title: **KREYNIMA — Development**. Visible content: **KREYNIMA**, **BUILD 000**, **Development foundation**, and “No project is open.” Startup logs had no compile error or Rust panic. |
| Resize / minimize / restore            | **Pass**. Window resized from 1100×760 to 780×560 with readable text. Minimize removed the on-screen window; restore brought it back. Restored size 1100×745 still showed the same content.                                                                                                                                                                                       |
| Development close / relaunch           | **Pass**. The close button ended `kreynima-desktop` and the watcher with exit code 0. A second `npm run desktop` opened the same titled window and content. Closing again exited 0. No crash report was written.                                                                                                                                                                  |
| Release build                          | **Pass**. `npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked` exited 0 in 62.5s and wrote `apps/desktop/src-tauri/target/release/kreynima-desktop` (Mach-O arm64, about 9.5 MB, ad hoc linker-signed). This is an unsigned local executable, not an installer or notarized release.                                                                        |
| Release launch / close / relaunch      | **Pass**. `./apps/desktop/src-tauri/target/release/kreynima-desktop` opened the same titled native window and BUILD 000 content without listening on port 1420. First and second launches both exited 0 after a normal close. Terminal output was empty; no panic or OS crash dialog appeared.                                                                                    |

Tauri also wrote generated ACL/capability JSON under `apps/desktop/src-tauri/gen/schemas/`. Those files are host build artifacts, not application source, and are now ignored.

This result covers only macOS 27.0.1 on Apple Silicon at commit `089503e`. It does not verify macOS Intel, other macOS versions, Windows (see the later Windows session), accessibility, signing, complete security, or release readiness. The configured window title remains **KREYNIMA — Development** for the release binary.

## Windows interactive smoke test

Recorded on 2026-10-21 (America/New_York) against `feat/build-000-foundation` commit `ddd23b0a6f847c7d4bec3234782ebb05a4b1b257`. This is an interactive desktop session on one Windows PC, not a hosted runner compile. Application source under `apps/` and `packages/` is unchanged since the macOS-tested commit `089503e`.

| Item              | Observed value                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS / architecture | Windows 11 Pro 25H2, build 26200.9711, 64-bit AMD64 (`x86_64-pc-windows-msvc`). `Win32_OperatingSystem.Caption` is Microsoft Windows 11 Pro; `HKLM\...\CurrentVersion.ProductName` still reports Windows 10 Pro.          |
| Node / npm        | v22.13.0 / 11.1.0                                                                                                                                                                                                         |
| Rust              | rustc 1.99.1 (58cf8f9c3 2026-10-13), cargo 1.99.1 (5f94df478 2026-08-27). The machine originally had rustc 1.86.0 / rustup 1.23.1, which cannot compile locked Tauri 2.12.4 (`rustc 1.90` required).                      |
| MSVC              | Visual Studio Build Tools 2022 17.13.6; MSVC 14.43.34808; `cl.exe` 19.43.34810 for x64                                                                                                                                    |
| Windows SDK       | Windows Software Development Kit 10.0.26100.7705. Before this session, VS listed `Microsoft.VisualStudio.Component.Windows11SDK.22621` but `Include`/`Lib`/`bin`, `windows.h`, `kernel32.lib`, and `rc.exe` were missing. |
| WebView2          | Microsoft Edge WebView2 Runtime 155.0.4283.62                                                                                                                                                                             |
| Tester            | Cursor agent on the maintainer Windows PC                                                                                                                                                                                 |

Prerequisites installed during this session, with explicit operator approval: `rustup self update` (1.23.1 → 1.29.2), `rustup toolchain install stable --force` (rustc 1.86.0 → 1.99.1), and elevated `winsdksetup.exe /features + /quiet /norestart` for SDK 10.0.26100.7705. No Cargo.lock, workflow, or advisory-check changes were made.

Commands, from the repository root. Port 1420 was free before each launch.

```sh
npm ci
npm run check
npm run desktop
```

The documented release build was run through `cmd.exe` because Windows PowerShell consumed extra `--` tokens and turned the command into `tauri build --locked`:

```bat
cmd /c "npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked"
```

```powershell
& ./apps/desktop/src-tauri/target/release/kreynima-desktop.exe
```

`npm ci` completed with 0 known JavaScript vulnerabilities. `npm run check` passed: TypeScript, ESLint, Prettier, two JavaScript/MCP tests, the MCP and desktop JavaScript builds, and the production license allowlist (100 packages). The first `npm run desktop` attempt failed before a window with `rustc 1.86.0 is not supported` (Tauri 2.12.4 requires rustc 1.90). After the approved toolchain update, the same command compiled and launched.

| Check                                  | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development launch (`npm run desktop`) | **Pass**. Cargo finished the `dev` profile in 2m 13s and ran `kreynima-desktop.exe`. A native window of class `Tauri Window` opened; it was not a browser tab. Title: **KREYNIMA — Development**. Visible content: **KREYNIMA**, **BuildWithDani · BUILD 000**, **Development foundation**, and “No project is open.” Startup logs had no compile error or Rust panic after the toolchain update. Screenshot: [dev-launch.png](evidence/windows-smoke-test/dev-launch.png). |
| Resize / minimize / restore            | **Pass**. Window resized from 1116×799 to 780×560 with readable BUILD 000 text (a vertical scrollbar appeared at the smaller size). Restore-size 1100×760 still showed the same content. Minimize moved the window off-screen (`IsIconic=true`); restore returned 1100×760 with the same title and content. The process stayed responding.                                                                                                                                  |
| Development close / relaunch           | **Pass**. `WM_CLOSE` ended `kreynima-desktop` and the `npm run desktop` watcher with exit code 0. Port 1420 was then free. A second `npm run desktop` opened the same titled window and BUILD 000 content (Cargo rebuilt in 10.47s). Closing again exited 0. No crash dialog appeared.                                                                                                                                                                                      |
| Release build                          | **Pass**. `cmd /c "npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked"` exited 0 in 2m 59s and wrote `apps/desktop/src-tauri/target/release/kreynima-desktop.exe` (8,636,416 bytes, FileDescription/ProductName **KREYNIMA**, version 0.0.0). This is an unsigned local executable, not an installer.                                                                                                                                                 |
| Release launch / close / relaunch      | **Pass**. `& ./apps/desktop/src-tauri/target/release/kreynima-desktop.exe` opened the same titled native window and BUILD 000 content without listening on port 1420. First close ended the process; a second launch reopened the same window; the second close exited 0. No console window, no OS crash dialog, and no Application Error / WER report for this executable. Screenshot: [release-launch.png](evidence/windows-smoke-test/release-launch.png).               |

The configured window title remains **KREYNIMA — Development** for the release binary, matching macOS.

This result covers only Windows 11 Pro 25H2 x64 at commit `ddd23b0`. It does not verify Windows ARM, other Windows versions, accessibility, signing, complete security, or release readiness.

## Acceptance gates

| BUILD 000 criterion                                 | Assessment                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development app launches in a supported environment | **Met for the two tested interactive sessions**. macOS 27.0.1 arm64 interactive development and release launches passed on `089503e`. Windows 11 Pro 25H2 x64 interactive development and release launches passed on `ddd23b0`. Hosted native compilation passed on both target runners. Windows ARM and macOS Intel remain untested. |
| Governance documents and architecture               | Present for BUILD 000 scope; legal review/reporting-contact gates remain documented.                                                                                                                                                                                                                                                  |
| MCP launches and is tested                          | **Met** for the standalone status foundation, including hosted Windows/macOS/Linux tests.                                                                                                                                                                                                                                             |
| CI and local scripts                                | **Met**. Push/PR triggering and target jobs are confirmed. The full workflow has an advisory failure; the temporary risk proposal is unapproved.                                                                                                                                                                                      |
| Applicable checks pass                              | **Partially met**. JavaScript and target compilation pass; the Rust advisory check fails; Linux native checks are blocked.                                                                                                                                                                                                            |
| Blockers documented                                 | **Met** by this record and linked policies.                                                                                                                                                                                                                                                                                           |

Before calling BUILD 000 complete:

1. Resolve the Rust maintenance advisory upstream or establish an explicitly reviewed disposition without silently hiding it.
2. Review the recorded [minimal native smoke tests](building.md#manual-native-window-smoke-test): macOS Apple Silicon at `089503e` and Windows 11 Pro x64 at `ddd23b0`, including development and built executable launch, readable content, resize/minimize/restore, clean close and relaunch. CI did not exercise visible desktop sessions. Do not infer untested architectures (Windows ARM, macOS Intel, other OS versions).
3. Establish verified confidential security/conduct contacts and review repository enforcement settings. Obtain legal review of trademark/brand policies, GPL-only interpretation, contribution terms, and distribution obligations before release.
4. Before distributing releases, separately plan reviewed identifiers/icons, installers, signing/notarization, and complete third-party notices/corresponding source. Those release tasks are not claimed complete by BUILD 000.

Stay on draft PR #1. Do not merge or begin BUILD 001 until authorized; its proposed roadmap remains documentation only.
