import { createHash } from "node:crypto";

export const ADVISORY = "RUSTSEC-2024-0370";
export const EXPIRES_AT = "2026-11-20T22:00:00.000Z";
export const REVIEW_AT = "2026-11-04T22:00:00.000Z";
const PROPOSED_AT = Date.parse("2026-10-21T04:00:00.000Z");

type ObjectValue = Record<string, unknown>;
export function object(value: unknown): ObjectValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected object");
  return value as ObjectValue;
}
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const data = object(value);
    return `{${Object.keys(data)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(data[key])}`)
      .join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("Non-JSON value");
  return encoded;
}
export const digest = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");

export interface Scope {
  advisory: typeof ADVISORY;
  package: "proc-macro-error";
  version: "1.0.4";
  stateSha256: string;
  graphSha256: string;
  advisorySha256: string;
}
export interface Report {
  exitCode: number | null;
  signal: string | null;
  error: string | null;
  stdout: string;
  stderr: string;
  scannerVersion: string;
}
export interface GateInput {
  report: Report;
  enabled: unknown;
  approval: unknown;
  scope: Scope;
  stateSha256: string;
  now: number;
}
export interface Decision {
  accepted: boolean;
  exceptionUsed: boolean;
  reason: string;
  findings: number;
}

// Order-independent dependency nodes/edges, including both macro introducers.
export function graphDigest(graphs: unknown): string {
  if (!Array.isArray(graphs) || graphs.length !== 1)
    throw new Error("Expected one advisory graph");
  const nodes = new Set<string>();
  const edges = new Set<string>();
  function walk(value: unknown): string {
    const node = object(value);
    const krate = object(node.Krate);
    if (typeof krate.name !== "string" || typeof krate.version !== "string")
      throw new Error("Invalid crate graph");
    const id = `${krate.name}@${krate.version}`;
    nodes.add(id);
    if (node.parents !== undefined) {
      if (!Array.isArray(node.parents)) throw new Error("Invalid parents");
      for (const parent of node.parents) edges.add(`${walk(parent)} -> ${id}`);
    }
    return id;
  }
  if (walk(graphs[0]) !== "proc-macro-error@1.0.4")
    throw new Error("Unexpected graph root");
  return digest({ nodes: [...nodes].sort(), edges: [...edges].sort() });
}

export function findingFingerprints(fields: ObjectValue) {
  return {
    graphSha256: graphDigest(fields.graphs),
    // Notes include the patched-version solution; any advisory update requires review.
    advisorySha256: digest({ advisory: fields.advisory, notes: fields.notes }),
  };
}

function timestamp(value: unknown): number {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(value)
  )
    throw new Error("Expected UTC approval timestamp");
  const n = Date.parse(value);
  if (!Number.isFinite(n) || new Date(n).toISOString() !== value)
    throw new Error("Invalid timestamp");
  return n;
}
function reviewUrl(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /^https:\/\/github\.com\/bwd-studio\/kreynima\/pull\/1#(?:pullrequestreview-\d+|issuecomment-\d+)$/.test(
      value,
    )
  );
}

export function evaluateGate(input: GateInput): Decision {
  let findings = 0;
  const fail = (reason: string): Decision => ({
    accepted: false,
    exceptionUsed: false,
    reason,
    findings,
  });
  try {
    const { report, scope } = input;
    if (!Number.isFinite(input.now)) return fail("Invalid clock");
    if (typeof input.enabled !== "boolean")
      return fail("Invalid activation switch");
    if (
      scope.advisory !== ADVISORY ||
      scope.package !== "proc-macro-error" ||
      scope.version !== "1.0.4"
    )
      return fail("Invalid exception scope");
    if (
      report.scannerVersion !== "cargo-deny 0.20.2" ||
      report.signal !== null ||
      report.error !== null ||
      ![0, 1].includes(report.exitCode as number)
    )
      return fail("Scanner failed or unsupported version");
    if (report.stdout.trim()) return fail("Unexpected scanner stdout");
    const lines = report.stderr.trim().split(/\r?\n/);
    const diagnostics: ObjectValue[] = [];
    let summary: ObjectValue | undefined;
    for (const line of lines) {
      const entry = object(JSON.parse(line));
      if (entry.type === "diagnostic" && !summary)
        diagnostics.push(object(entry.fields));
      else if (entry.type === "summary" && !summary)
        summary = object(object(entry.fields).advisories);
      else return fail("Unknown, duplicated, or out-of-order scanner record");
    }
    findings = diagnostics.length;
    if (
      !summary ||
      Object.keys(summary).sort().join(",") !== "errors,helps,notes,warnings"
    )
      return fail("Missing or invalid scan summary");
    const counts = { errors: 0, warnings: 0, notes: 0, helps: 0 };
    for (const fields of diagnostics) {
      const severity = fields.severity;
      if (severity === "error") counts.errors++;
      else if (severity === "warning") counts.warnings++;
      else if (severity === "note") counts.notes++;
      else if (severity === "help") counts.helps++;
      else return fail("Unknown diagnostic severity");
    }
    if (canonical(counts) !== canonical(summary))
      return fail("Incomplete or inconsistent scan report");
    if ((counts.errors > 0 ? 1 : 0) !== report.exitCode)
      return fail("Scanner exit/report mismatch");
    if (diagnostics.length === 0) {
      if (input.enabled || input.approval !== null)
        return fail("Expected finding absent; remove/review stale acceptance");
      return {
        accepted: true,
        exceptionUsed: false,
        reason: "Unfiltered scan is clean",
        findings,
      };
    }
    // No unrelated diagnostic, even a warning, can be covered by this exception.
    if (diagnostics.length !== 1)
      return fail("Other or duplicate findings remain blocking");
    const fields = diagnostics[0];
    const advisory = object(fields.advisory);
    if (
      fields.severity !== "error" ||
      fields.code !== "unmaintained" ||
      advisory.id !== ADVISORY ||
      advisory.package !== "proc-macro-error" ||
      advisory.informational !== "unmaintained" ||
      advisory.cvss !== null ||
      advisory.withdrawn !== null
    )
      return fail("Unrelated or reclassified advisory remains blocking");
    const fingerprints = findingFingerprints(fields);
    if (
      fingerprints.graphSha256 !== scope.graphSha256 ||
      fingerprints.advisorySha256 !== scope.advisorySha256 ||
      input.stateSha256 !== scope.stateSha256
    )
      return fail("Dependency, workflow, graph, or advisory state changed");
    if (!input.enabled || input.approval === null)
      return fail("Exception disabled or maintainer approval missing");
    if (input.now >= Date.parse(EXPIRES_AT))
      return fail("Exception expired at 2026-11-20 17:00 America/New_York");
    const approval = object(input.approval);
    const keys = [
      "approvedBy",
      "approvedAt",
      "approvalUrl",
      "reviewedAt",
      "reviewUrl",
      "scopeSha256",
      "expiresAt",
    ].sort();
    if (Object.keys(approval).sort().join(",") !== keys.join(","))
      return fail("Invalid approval record fields");
    if (
      approval.approvedBy !== "BuildWithDani" ||
      !reviewUrl(approval.approvalUrl) ||
      !reviewUrl(approval.reviewUrl) ||
      approval.expiresAt !== EXPIRES_AT ||
      approval.scopeSha256 !== digest(scope)
    )
      return fail("Approval identity, evidence, scope, or expiry mismatch");
    const at = timestamp(approval.approvedAt);
    const reviewed = timestamp(approval.reviewedAt);
    if (
      at < PROPOSED_AT ||
      at > input.now ||
      reviewed < at ||
      reviewed > input.now
    )
      return fail("Invalid approval/review time");
    if (input.now >= Date.parse(REVIEW_AT) && reviewed < Date.parse(REVIEW_AT))
      return fail("Interim review overdue");
    return {
      accepted: true,
      exceptionUsed: true,
      reason: `${ADVISORY} remains present; time-limited maintainer acceptance applied`,
      findings,
    };
  } catch (error) {
    return fail(
      `Invalid security evidence: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}
