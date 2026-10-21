import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  evaluateGate,
  digest,
  EXPIRES_AT,
  REVIEW_AT,
  type GateInput,
  type Scope,
} from "../scripts/rust-security-policy.ts";
import { dependencyState } from "../scripts/rust-security-state.ts";

const raw = readFileSync(
  "tests/fixtures/rust-security/cargo-deny-0.20.2.jsonl",
  "utf8",
);
const scope = JSON.parse(
  readFileSync("security/rust-advisory-scope.json", "utf8"),
) as Scope;
// Synthetic approval evidence is confined to tests. No actual approval is granted.
function candidate(): GateInput {
  return {
    report: {
      exitCode: 1,
      signal: null,
      error: null,
      stdout: "",
      stderr: raw,
      scannerVersion: "cargo-deny 0.20.2",
    },
    enabled: true,
    scope: structuredClone(scope),
    stateSha256: scope.stateSha256,
    now: Date.parse("2026-10-22T12:00:00.000Z"),
    approval: {
      approvedBy: "BuildWithDani",
      approvedAt: "2026-10-21T12:00:00.000Z",
      approvalUrl:
        "https://github.com/bwd-studio/kreynima/pull/1#issuecomment-1",
      reviewedAt: "2026-10-21T12:00:00.000Z",
      reviewUrl: "https://github.com/bwd-studio/kreynima/pull/1#issuecomment-1",
      scopeSha256: digest(scope),
      expiresAt: EXPIRES_AT,
    },
  };
}
function mutate(
  input: GateInput,
  change: (lines: Record<string, unknown>[]) => void,
) {
  const lines = input.report.stderr
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  change(lines);
  input.report.stderr =
    lines.map((line) => JSON.stringify(line)).join("\n") + "\n";
}
function changeFields(
  input: GateInput,
  change: (fields: Record<string, unknown>) => void,
) {
  mutate(input, (lines) => change(lines[0].fields as Record<string, unknown>));
}
function block(input: GateInput, reason?: RegExp) {
  const decision = evaluateGate(input);
  assert.equal(decision.accepted, false, JSON.stringify(decision));
  assert.equal(decision.exceptionUsed, false);
  if (reason) assert.match(decision.reason, reason);
}

test("activation is explicit and changed foundation scope cannot carry approval forward", () => {
  const control = JSON.parse(
    readFileSync("security/rust-advisory-exception.json", "utf8"),
  );
  assert.deepEqual(Object.keys(control), ["enabled"]);
  assert.equal(typeof control.enabled, "boolean");
  const actualState = dependencyState();
  if (actualState !== scope.stateSha256) {
    // BUILD 001 deliberately does not refresh or inherit BUILD 000 risk acceptance.
    assert.equal(
      control.enabled,
      false,
      "Changed, unapproved scope must remain disabled",
    );
    const input = candidate();
    input.stateSha256 = actualState;
    block(input, /state changed/);
  }
});
test("only the exact live-report shape can use synthetic valid approval", () => {
  const result = evaluateGate(candidate());
  assert.equal(result.accepted, true);
  assert.equal(result.exceptionUsed, true);
  assert.equal(result.findings, 1);
});
test("both activation controls are required", () => {
  const input = candidate();
  input.enabled = false;
  block(input, /disabled/);
  input.enabled = true;
  input.approval = null;
  block(input, /approval missing/);
});
test("unrelated advisory and another advisory on the same package block", () => {
  for (const packageName of ["other-package", "proc-macro-error"]) {
    const input = candidate();
    changeFields(input, (f) => {
      const a = f.advisory as Record<string, unknown>;
      a.id = "RUSTSEC-2099-0001";
      a.package = packageName;
    });
    block(input, /Unrelated/);
  }
});
test("an additional finding, including a warning, cannot be waived", () => {
  const input = candidate();
  mutate(input, (lines) => {
    const added = structuredClone(lines[0]);
    const fields = added.fields as Record<string, unknown>;
    fields.severity = "warning";
    fields.code = "yanked";
    lines.splice(1, 0, added);
    (
      lines[2].fields as { advisories: { warnings: number } }
    ).advisories.warnings = 1;
  });
  block(input, /Other or duplicate/);
});
test("expiry is fixed at November 20 5 PM New York, including exact boundary", () => {
  const input = candidate();
  const a = input.approval as Record<string, unknown>;
  a.reviewedAt = REVIEW_AT;
  input.now = Date.parse(EXPIRES_AT) - 1;
  assert.equal(evaluateGate(input).accepted, true);
  for (const time of [Date.parse(EXPIRES_AT), Date.parse(EXPIRES_AT) + 1]) {
    input.now = time;
    block(input, /expired/);
  }
});
test("missed interim review blocks at its exact boundary; recorded fresh review restores eligibility", () => {
  const input = candidate();
  input.now = Date.parse(REVIEW_AT);
  block(input, /review overdue/);
  (input.approval as Record<string, unknown>).reviewedAt = REVIEW_AT;
  assert.equal(evaluateGate(input).accepted, true);
});
test("approval cannot extend expiry, change scope, impersonate another owner, or use unrelated evidence", () => {
  for (const [key, value] of Object.entries({
    expiresAt: "2027-01-01T00:00:00.000Z",
    scopeSha256: "changed",
    approvedBy: "someone-else",
    approvalUrl: "https://github.com/other/repo/pull/1#issuecomment-1",
    reviewUrl: "https://example.com",
  })) {
    const input = candidate();
    (input.approval as Record<string, unknown>)[key] = value;
    block(input);
  }
});
test("future, invalid, or backdated approval/review times block", () => {
  for (const [key, value] of [
    ["approvedAt", "2026-10-23T12:00:00.000Z"],
    ["approvedAt", "2026-10-20T12:00:00.000Z"],
    ["reviewedAt", "2026-10-23T12:00:00.000Z"],
    ["reviewedAt", "not-a-date"],
  ]) {
    const input = candidate();
    (input.approval as Record<string, unknown>)[key] = value;
    block(input);
  }
});
test("changed dependency/workflow state, graph, or advisory metadata invalidates acceptance", () => {
  const state = candidate();
  state.stateSha256 = "changed";
  block(state, /state changed/);
  const graph = candidate();
  changeFields(graph, (f) => {
    const g = f.graphs as { Krate: { version: string } }[];
    g[0].Krate.version = "1.0.5";
  });
  block(graph);
  const metadata = candidate();
  changeFields(metadata, (f) => {
    (f.advisory as Record<string, unknown>).description = "updated advisory";
  });
  block(metadata, /state changed/);
  const severity = candidate();
  changeFields(severity, (f) => {
    (f.advisory as Record<string, unknown>).cvss = "new vulnerability";
  });
  block(severity, /reclassified/);
});
test("scanner failures, signals, malformed/truncated reports and unsupported output fail closed", () => {
  for (const update of [
    { exitCode: 2 },
    { exitCode: null },
    { signal: "SIGTERM" },
    { error: "ENOENT" },
    { scannerVersion: "cargo-deny 99" },
    { stdout: "unexpected" },
    { stderr: "" },
    { stderr: "not JSON" },
  ]) {
    const input = candidate();
    Object.assign(input.report, update);
    block(input);
  }
  const missing = candidate();
  missing.report.stderr = raw.trim().split("\n")[0];
  block(missing, /summary/);
  const mismatch = candidate();
  mismatch.report.exitCode = 0;
  block(mismatch, /mismatch/);
  const summary = candidate();
  mutate(summary, (lines) => {
    (lines[1].fields as { advisories: { errors: number } }).advisories.errors =
      0;
  });
  block(summary, /inconsistent/);
  const unknown = candidate();
  unknown.report.stderr += '{"type":"unknown"}\n';
  block(unknown, /Unknown/);
});
test("a genuinely clean scan passes without approval; a stale armed exception does not", () => {
  const input = candidate();
  input.report.stderr =
    '{"type":"summary","fields":{"advisories":{"errors":0,"warnings":0,"notes":0,"helps":0}}}\n';
  input.report.exitCode = 0;
  block(input, /absent/);
  input.enabled = false;
  input.approval = null;
  const result = evaluateGate(input);
  assert.equal(result.accepted, true);
  assert.equal(result.exceptionUsed, false);
});

test("fingerprinting detects actual tracked file edits and newly tracked dependency files", () => {
  const cwd = mkdtempSync(join(tmpdir(), "kreynima-scope-"));
  try {
    execFileSync("git", ["init", "--quiet"], { cwd });
    mkdirSync(join(cwd, "apps/desktop/src-tauri"), { recursive: true });
    const lock = join(cwd, "apps/desktop/src-tauri/Cargo.lock");
    writeFileSync(lock, "original lock");
    execFileSync("git", ["add", "apps"], { cwd });
    const original = dependencyState(cwd);
    writeFileSync(lock, "changed lock");
    assert.notEqual(dependencyState(cwd), original);
    writeFileSync(lock, "original lock");
    assert.equal(dependencyState(cwd), original);
    writeFileSync(
      join(cwd, "apps/desktop/src-tauri/Cargo.toml"),
      "new dependency manifest",
    );
    execFileSync("git", ["add", "apps"], { cwd });
    assert.notEqual(dependencyState(cwd), original);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
