# BUILD 000 Rust advisory gate

Status: implementation prepared for review, **disabled**. No maintainer approval has been recorded or activated. This implements the mechanism requested after the [risk proposal](RUSTSEC-2024-0370-risk-acceptance-proposal.md); it does not approve that proposal, merge PR #1, or authorize BUILD 001.

## What CI does

The existing `rust-dependencies` job now captures an **unfiltered, all-target** `cargo deny --format json ... check advisories` report using cargo-deny 0.20.2. No Cargo ignore, target filter, severity downgrade, or blanket `continue-on-error` was added. The capture step records the scanner's real exit/signal/error; its own success means evidence was saved, not that the advisory scan passed.

A separate step runs the existing `cargo deny ... check licenses bans sources`. Its original nonzero exit remains blocking regardless of any advisory decision. It runs even if an earlier report-capture step fails, provided scanner installation succeeded. The adjudication and artifact steps run after failures so evidence is preserved. Installation, capture, integrity, adjudication, and upload failures cannot be waived by this exception. The JavaScript/npm audit/license jobs and Windows/macOS native jobs remain unchanged.

`actions/upload-artifact@v4` uploads `rust-security-report-RUN_ID-ATTEMPT`, even when blocking, with requested retention of 90 days subject to GitHub repository policy. It includes:

- `raw-advisories.jsonl`: complete, unmodified scanner stderr, including every advisory, its dependency graph and summary.
- `raw-stdout.txt` and `scan.json`: scanner stdout, version, exit code, signal/error and matching raw data.
- `state.sha256`: the captured dependency/workflow fingerprint.
- `integrity.txt`: independent license/source/ban output, including failures.
- `decision.json`: gate outcome, whether acceptance was used, finding count, and reason.

Raw NDJSON is also printed in the job log. The job summary records the blocking/accepted decision and the finding remains an Actions warning. With an approved exception, the raw scan still exits 1 and contains RUSTSEC-2024-0370; only the companion adjudication can pass. Such a pass means **accepted residual risk**, never a clean scan, remediation, complete security, or release readiness. Missing/failed uploads block the job. If scanning cannot run, the job fails; no complete scan report is claimed in that case.

## Fail-closed rules

The exception is only for RUSTSEC-2024-0370, `proc-macro-error` 1.0.4, informational/unmaintained, with unchanged advisory metadata and patched-version notes. `security/rust-advisory-scope.json` pins the full reported dependency node/edge graph plus fingerprints of tracked application/package sources, manifests/lockfiles, Cargo configuration, TypeScript configuration, `deny.toml`, and workflows. This includes both macro introducers. Any byte change to these recorded files, or a new tracked file under those paths, changes eligibility. Approval controls and documentation are deliberately outside the dependency-state fingerprint so activation/review documentation need not change the program state.

The gate requires one complete, consistent cargo-deny 0.20.2 NDJSON report with exactly that finding. Other diagnostics, including warnings, duplicate findings, changed classification/metadata, a different dependency graph/version, malformed/truncated output, mismatched summaries/exit status, unexpected stdout, signals, or scanner errors block. Capture is bounded to 32 MiB; overflow is a scanner error and blocks rather than treating a partial report as valid. A genuinely clean scan passes with controls disabled, but an armed/stale acceptance whose expected finding disappeared blocks until reviewed and removed.

Two controls must agree:

1. `security/rust-advisory-exception.json` must have the single boolean field `enabled: true`. It is **false in this implementation**.
2. The maintainer-controlled Actions **repository variable** `KREYNIMA_RUSTSEC_2024_0370_APPROVAL` must contain a valid approval JSON record. No variable was created or set by this task. Missing/invalid approval blocks. Do not place tokens or secrets in it.

The record must name CODEOWNER `BuildWithDani`, real PR #1 approval/review permalinks, UTC timestamps (with `.000Z`), and the SHA-256 of the entire canonical scope object. The gate verifies the configured identity/link shape and admin-supplied scope/times; it does **not** authenticate a GitHub review through an API. A repository administrator must verify the approval's author, content, authority, and evidence before setting the variable. Repository-variable write access, CODEOWNERS review of gate/workflow/control changes, and appropriate branch protection are trust boundaries, not protections this PR configures automatically. A malicious workflow edit cannot be made safe by a script within that same workflow.

Expiry is hardcoded to **2026-11-20T22:00:00.000Z**, November 20, 2026 at **5 PM America/New_York**. Neither the scope file nor approval variable can extend it. At the exact boundary every gate evaluation blocks. On/after **2026-11-04T22:00:00.000Z**, the record needs an explicit review timestamp at or after that interim deadline, no earlier than approval and no later than the runner's current time. Approval cannot be future-dated or predate the proposal. The executable CLI uses `Date.now()` with no environment clock override; synthetic clocks/approval are confined to unit tests.

Completed GitHub statuses are historical and do not rewrite themselves at expiry. **Rerun the gate immediately before a merge decision**; never rely on an old green result after a review deadline, expiry, or a newly discovered risk. No background status-revocation service is claimed. New supported fixes or exploitation evidence still require the maintainer's immediate manual suspension under the proposal; scanner metadata changes are detected automatically when a fresh scan runs.

## Exact activation procedure — only after explicit approval

This task performs none of these activation steps.

1. Review this implementation, passing tests, current raw reports, the original risk proposal, and both recorded native smoke tests. Recheck RustSec/upstream status. The accountable maintainer must explicitly accept this exact risk, ownership, scope, review and expiry dates, and controls in a real PR #1 review/comment. Record its permalink in the proposal/validation record. Generic PR approval or a request to prepare a mechanism is not acceptance.
2. Verify the application/dependency/workflow state still matches the scope and review its fingerprints. Do not regenerate hashes merely to bypass a mismatch. Obtain the canonical scope digest with:

   ```sh
   node --import tsx --input-type=module -e "import {readFileSync} from 'node:fs'; import {digest} from './scripts/rust-security-policy.ts'; console.log(digest(JSON.parse(readFileSync('security/rust-advisory-scope.json','utf8'))));"
   ```

3. In a separately reviewed activation commit, change only `enabled` to `true` and update the approval documentation. Do not change `deny.toml`, hardcoded dates, scanner checks, or scope to make activation pass. The control file is not itself evidence of approval.
4. A repository administrator verifies the actual approval/review and sets Settings → Secrets and variables → Actions → Variables → `KREYNIMA_RUSTSEC_2024_0370_APPROVAL` to a JSON object with **exactly** these fields, replacing every placeholder with real evidence:

   ```json
   {
     "approvedBy": "BuildWithDani",
     "approvedAt": "REPLACE_WITH_REAL_UTC_TIMESTAMP",
     "approvalUrl": "REPLACE_WITH_REAL_PR_1_REVIEW_OR_COMMENT_PERMALINK",
     "reviewedAt": "REPLACE_WITH_REAL_UTC_TIMESTAMP",
     "reviewUrl": "REPLACE_WITH_REAL_PR_1_REVIEW_OR_COMMENT_PERMALINK",
     "scopeSha256": "REPLACE_WITH_REVIEWED_CANONICAL_SCOPE_DIGEST",
     "expiresAt": "2026-11-20T22:00:00.000Z"
   }
   ```

   Timestamps use `YYYY-MM-DDTHH:mm:ss.000Z`; URLs must be `https://github.com/bwd-studio/kreynima/pull/1#pullrequestreview-NUMBER` or `#issuecomment-NUMBER`. Initially reviewedAt/reviewUrl may equal the actual approval evidence. After the interim deadline, a new explicit review and matching metadata are required. Do not copy synthetic unit-test approval URLs. An unapproved scope refresh cannot reuse an old variable: its digest must match the separately reviewed scope.

5. Run fresh CI, inspect the artifact and summary, and confirm: raw finding present/exit 1; gate acceptance applied with the correct dates; independent integrity step passes; all other jobs pass. Unexpected findings or evidence gaps remain blocking. Approval is not merge authorization; keep the PR draft until a separate maintainer decision satisfies the remaining gates. Rerun just before any merge.

## Rollback and remediation

Delete/empty the repository variable first, then revert `enabled` to false in a reviewed commit. Cancel runs that already captured the old variable and rerun the current commit; existing completed results retain their historical outcome. Record revocation and keep the advisory job blocking until supported remediation or a new explicit decision. Do not disable the job, weaken branch protection, or delete raw evidence.

Any changed dependency/workflow/advisory state invalidates eligibility; the fixed date also blocks regardless of the activation switch. To adopt a supported upstream fix, remove the stale approval and disable the control, upgrade in a reviewed change, and rerun the full unfiltered scan plus independent integrity, JavaScript/MCP, native build, and relevant smoke checks. If the finding disappears while armed, the gate deliberately requires this cleanup. No automatic renewal is implemented.

## Tests and local reproduction

`npm run check` includes `tests/rust-security.test.ts`. It tests synthetic valid approval as a positive control, both activation switches, unrelated/new/same-package advisories, duplicate/warning findings, changed dependency/graph/advisory state, invalid approval evidence/timestamps, missing review, exact expiry boundary, scanner failures, malformed/truncated reports, stale acceptance, and a clean scan. Synthetic approval in tests does not activate CI.

With Rust/cargo-deny installed, run these from the repository root:

```sh
node --import tsx scripts/capture-rust-advisories.ts
node --import tsx scripts/check-rust-advisories.ts
cargo deny --manifest-path apps/desktop/src-tauri/Cargo.toml check licenses bans sources
```

The second command is expected to exit 1 with the checked-in disabled control. Evidence is written under ignored `security-reports/`; no generated evidence or approval record is committed as a substitute for actual CI results.
