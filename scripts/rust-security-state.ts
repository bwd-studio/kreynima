import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { digest } from "./rust-security-policy.ts";

export function dependencyState(cwd = process.cwd()): string {
  // Fixed Git arguments, never client input. Include program files, all manifests,
  // lockfiles, config, and workflows; exclude approval controls to allow activation.
  const files = execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--",
      "apps",
      "packages",
      "scripts",
      "tests/rust-security.test.ts",
      "tests/fixtures/rust-security",
      ".cargo",
      ".github/workflows",
      "Cargo.toml",
      "Cargo.lock",
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "deny.toml",
    ],
    { encoding: "utf8", cwd },
  )
    .split("\0")
    .filter(Boolean)
    .sort();
  if (!files.includes("apps/desktop/src-tauri/Cargo.lock"))
    throw new Error("Missing tracked Cargo.lock");
  return digest(
    files.map((path) => ({
      path,
      sha256: createHash("sha256")
        .update(readFileSync(join(cwd, path)))
        .digest("hex"),
    })),
  );
}
