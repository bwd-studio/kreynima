import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  evaluateGate,
  ADVISORY,
  type Report,
  type Scope,
} from "./rust-security-policy.ts";
import { dependencyState } from "./rust-security-state.ts";

const dir = "security-reports";
mkdirSync(dir, { recursive: true });
let decision;
try {
  const report = JSON.parse(readFileSync(`${dir}/scan.json`, "utf8")) as Report;
  // Ensure the preserved artifact and adjudicated evidence are the same bytes.
  if (
    report.stderr !== readFileSync(`${dir}/raw-advisories.jsonl`, "utf8") ||
    report.stdout !== readFileSync(`${dir}/raw-stdout.txt`, "utf8")
  )
    throw new Error("Raw capture mismatch");
  const state = dependencyState();
  if (readFileSync(`${dir}/state.sha256`, "utf8").trim() !== state)
    throw new Error("State changed since capture");
  const control = JSON.parse(
    readFileSync("security/rust-advisory-exception.json", "utf8"),
  );
  if (Object.keys(control).join(",") !== "enabled")
    throw new Error("Invalid activation file");
  const encoded = process.env.KREYNIMA_RUSTSEC_2024_0370_APPROVAL;
  decision = evaluateGate({
    report,
    enabled: control.enabled,
    approval: encoded ? JSON.parse(encoded) : null,
    scope: JSON.parse(
      readFileSync("security/rust-advisory-scope.json", "utf8"),
    ) as Scope,
    stateSha256: state,
    now: Date.now(),
  });
} catch (error) {
  decision = {
    accepted: false,
    exceptionUsed: false,
    findings: null,
    reason:
      error instanceof Error ? error.message : "Missing security evidence",
  };
}
writeFileSync(`${dir}/decision.json`, JSON.stringify(decision, null, 2) + "\n");
const summary = `## Rust advisory gate\n\n- Gate: **${decision.accepted ? "PASS" : "BLOCKED"}**\n- Temporary acceptance applied: **${decision.exceptionUsed ? "YES" : "NO"}**\n- Finding count: ${decision.findings ?? "unknown"}\n- ${decision.reason}\n- ${ADVISORY} is never removed from the raw report. A gate pass under acceptance is not a clean scan or remediation.\n- Full raw scanner JSON, exit status, state fingerprint, decision, and integrity report: rust-security-report artifact.\n`;
process.stdout.write(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
if (decision.findings)
  process.stdout.write(
    `::warning title=Rust advisory finding remains visible::${ADVISORY} may be eligible only with valid explicit approval; inspect the full raw report for every finding.\n`,
  );
if (!decision.accepted) process.exitCode = 1;
