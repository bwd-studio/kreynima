import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dependencyState } from "./rust-security-state.ts";
import type { Report } from "./rust-security-policy.ts";

const dir = "security-reports";
mkdirSync(dir, { recursive: true });
const version = spawnSync("cargo", ["deny", "--version"], { encoding: "utf8" });
const scan = spawnSync(
  "cargo",
  [
    "deny",
    "--format",
    "json",
    "--manifest-path",
    "apps/desktop/src-tauri/Cargo.toml",
    "check",
    "advisories",
  ],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);
const report: Report = {
  scannerVersion: version.status === 0 ? version.stdout.trim() : "unavailable",
  exitCode: scan.status,
  signal: scan.signal,
  error: scan.error?.message ?? null,
  stdout: scan.stdout ?? "",
  stderr: scan.stderr ?? "",
};
// Capture never calls a failed scan a pass. The next gate adjudicates its result.
writeFileSync(join(dir, "raw-advisories.jsonl"), report.stderr);
writeFileSync(join(dir, "raw-stdout.txt"), report.stdout);
writeFileSync(join(dir, "scan.json"), JSON.stringify(report, null, 2) + "\n");
writeFileSync(join(dir, "state.sha256"), dependencyState() + "\n");
process.stderr.write(report.stderr);
process.stdout.write(
  `Unfiltered capture complete; scanner exit ${report.exitCode}. This is not a passing advisory decision.\n`,
);
