# Proposed temporary acceptance: RUSTSEC-2024-0370

**PROPOSAL ONLY — NOT APPROVED.** No risk acceptance, check waiver, Cargo exception, or merge approval has been recorded. The [gate implementation](rust-advisory-gate.md) is prepared but disabled. No `deny.toml`, dependency, or branch-protection exception is active. The unfiltered advisory finding and blocking gate remain visible.

## Decision requested

The accountable maintainer (proposed owner: @BuildWithDani, the current CODEOWNER) may explicitly accept the limited maintenance risk below for the BUILD 000 Windows/macOS development foundation while a supported upstream fix is unavailable. Approval must name this advisory, package/version, scope, dates, and controls, and link to the approving PR review/comment. A generic review approval or request to prepare this document is not risk acceptance.

| Field                               | Proposed value                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Proposal date                       | 2026-10-21, America/New_York                                                                                                           |
| Status / accepted risks             | Unapproved / none recorded                                                                                                             |
| Advisory                            | **RUSTSEC-2024-0370 only**, currently informational/unmaintained                                                                       |
| Package                             | `proc-macro-error` **1.0.4** only                                                                                                      |
| Reference state                     | PR #1, commit `585e8bcb37141d0b7054616c0cacd9d4b022fe60`; documentation-only successors may refer to the same program/dependency state |
| Cargo.lock SHA-256                  | `1950c2db65396199e43174ac4644dd47d3a1b72ddfb9df3b9f2f45a040e1e7a6`                                                                     |
| Accountable owner                   | @BuildWithDani, subject to explicit acceptance of ownership                                                                            |
| Effective date                      | Only the timestamp of an explicit approval; not backdated                                                                              |
| Required interim review             | **2026-11-04 at 17:00 America/New_York (22:00 UTC)**, or earlier on a trigger below                                                    |
| Hard expiration                     | **2026-11-20 at 17:00 America/New_York (22:00 UTC)**; no automatic extension                                                           |
| Approval evidence                   | **Not recorded**                                                                                                                       |
| Review evidence / next action owner | **Not recorded**; owner must record findings and the next action at each review                                                        |

The hard expiry is fixed 30 calendar dates after the proposal date; later approval shortens the remaining window rather than starting a new rolling period. Approval after the interim-review deadline requires a fresh investigation first. A missed interim review suspends any acceptance until a new explicit review; expiration always ends it. A new dated proposal and approval are required for renewal.

## Exact affected chain and platform scope

See the [investigation](RUSTSEC-2024-0370.md) for registry/upstream evidence and reproduction commands. The locked Linux/BSD GTK paths include:

```text
kreynima-desktop → tauri 2.12.4 → gtk 0.18.2
  → gtk3-macros 0.18.2 → proc-macro-error 1.0.4
  → glib 0.18.5 → glib-macros 0.18.5 → proc-macro-error 1.0.4
```

Tauri-runtime-wry 2.12.2, Tao 0.37.1, Wry 0.57.0, WebKit2GTK, and Muda also reach this toolkit stack. Both macro introducers matter. Inverse-tree checks found no path to the affected package for Windows x64, macOS Apple Silicon, or macOS Intel; that is resolution evidence, not certification of all those platforms. Actual hosted compilation evidence covers Windows x64 and macOS Apple Silicon only.

The proposed acceptance covers retaining this exact finding in the all-platform dependency inventory of the BUILD 000 Windows/macOS development foundation. It does **not** approve Linux/BSD native build/use/distribution, additional platforms, future BUILD scopes, public binary releases, new dependencies or versions, another advisory on the same package, or a runtime execution vulnerability. The recorded macOS Apple Silicon and Windows 11 Pro x64 interactive launches are separate evidence and cannot be waived by this proposal. Windows ARM and macOS Intel remain untested.

## Justification and residual risk

RustSec identifies loss of maintenance and lists no patched version; it does not identify a specific exploitable flaw. The package is used by procedural macros when compiling the affected GTK stack. It was absent from the resolved target trees for this application's Windows/macOS builds. Full-graph scanning still correctly reports it because the lockfile includes Linux/BSD dependencies.

The prior registry refresh and `cargo update --dry-run` found no compatible updates. New GTK 0.19 / GLib 0.22 macro releases remove this dependency, but the current supported Tauri/Wry stack requires GTK `^0.18`. The `proc-macro-error2` fork is archived. Alternatives require upstream consumer migrations. Unsupported overrides could introduce API/type/native-linking failures and do not constitute a supported fix.

Residual risk is future unfixed defects and build-host/dependency supply-chain exposure if affected toolkit code is built, plus retention of unmaintained code in the source/dependency inventory. A lockfile is reproducibility control, not remediation. Absence from the checked target graphs and this informational classification do not establish zero risk, complete security, or legal clearance. Acceptance would be a limited maintainer decision, not a technical fix.

## Controls preserved and immediate review triggers

- Keep full unfiltered advisory capture plus independently blocking `cargo deny ... check licenses bans sources`. No Cargo ignore, target filter, severity downgrade, or blanket `continue-on-error` is used. The companion gate remains blocked while approval is disabled; raw scanner failures remain preserved even if a future explicit acceptance allows only this finding.
- Keep all other Rust advisory, source, license, and ban checks, npm audit, production license checks, TypeScript/lint/format/tests, and Windows/macOS build checks unchanged. Other findings are never covered by this proposal.
- Retain the advisory ID, exact package/version, current dependency paths, linked raw CI output, proposal status, and dates in the PR and validation record. A failed advisory job remains reported as failed; it must never be described as passed because risk is accepted.
- Recheck the [RustSec record](https://github.com/RustSec/advisory-db/blob/main/crates/proc-macro-error/RUSTSEC-2024-0370.md), [Tauri #10910](https://github.com/tauri-apps/tauri/issues/10910), and published toolkit releases at each review and before any merge decision. Record results, not just a future intention. No monitoring automation is claimed to exist.
- Immediately suspend any approval on a lockfile/chain/package/feature/platform change; a new advisory or evidence of exploitation; a classification/severity change; a supported remediation becoming available; a missed review; or expiration. Reassess scope rather than carrying approval forward silently.

## Upstream remediation and exit criteria

The owner should track Tauri #10910 and supported Tauri/runtime/Wry/WebKit/GTK releases, or a supported backport on both affected 0.18 macro branches. No upstream message or contribution has been sent by this task. Prefer published supported updates; do not switch to an unreleased branch or archived fork to obtain a clean report.

When a viable update appears, prepare the smallest compatible upgrade; verify removal from the all-target inverse tree; rerun full Rust advisory/license/source/ban checks, JavaScript/MCP checks, and Windows/macOS compilation; then repeat the relevant interactive smoke tests. Close the acceptance only with evidence that the original finding is removed or the maintainer has ended the activity it covered. Do not renew by editing the expiry date without a new approval.

## Check-policy implications and any later scoped exception

The maintainer requested a testable mechanism after this proposal was written. It is now [implemented but disabled](rust-advisory-gate.md). The checked-in control is false, no approval variable was set by this task, and no risk has been accepted. Raw all-target findings and scanner exit status are uploaded and printed; licenses/bans/sources retain an independent required step. Other security/build checks remain required. Exact scope/graph/advisory fingerprints and hardcoded expiry are tested, with unrelated findings and stale/invalid evidence remaining blocking.

Activation requires both a separately reviewed control-file change and a verified maintainer approval record in an administrator-controlled repository variable. Follow the linked exact activation/rollback procedure; implementation approval is not risk approval. A future accepted gate result must be described as accepted residual risk, never as a clean scan. No branch-protection bypass, merge, or BUILD 001 is authorized.

## Explicit approval record and merge prerequisites

Before accepting this risk, the maintainer must record: decision (approve/reject), their identity, approval timestamp and permalink, the exact package/advisory/lockfile scope, interim review and hard expiry, ownership, and acknowledgement that recorded interactive smoke-test evidence and other gates remain mandatory. Until then, **accepted risks: none**.

Before any merge, separately require:

1. Explicit risk acceptance under these terms or a verified supported fix, and an explicit decision on how any still-failing required advisory check is handled under repository policy. This proposal authorizes no check-policy bypass.
2. Review of the recorded Windows 11 Pro x64 interactive development and built-executable smoke tests at `ddd23b0` and the macOS Apple Silicon evidence at `089503e`, including any program changes since those tested commits.
3. Review of all other required check results and remaining governance/security/legal gates. This proposal waives none of them and grants no release-readiness claim.
4. An explicit maintainer decision to take PR #1 out of draft and separate authorization to merge. This task grants neither and does not authorize BUILD 001.
