import process from "node:process";
import { execSync } from "node:child_process";
// Static local npm query; no client or project input is executed.
const packages = JSON.parse(
  execSync("npm query .prod --json", { encoding: "utf8" }),
);
const allowed = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "0BSD",
  "CC0-1.0",
  "CC-BY-4.0",
  "Python-2.0",
  "BlueOak-1.0.0",
]);
const external = packages.filter((pkg) =>
  pkg.location?.includes("node_modules/"),
);
if (external.length === 0)
  throw new Error(
    "No production dependencies found; refusing an empty license check",
  );
const rejected = external.filter((pkg) => !allowed.has(pkg.license));
if (rejected.length)
  throw new Error(
    `Review licenses: ${rejected.map((pkg) => `${pkg.name}@${pkg.version}: ${pkg.license ?? "UNKNOWN"}`).join(", ")}`,
  );
process.stdout.write(
  `Checked licenses of ${external.length} installed production dependencies.\n`,
);
