# BUILD 001 validation — dependent draft

Date: 2026-10-21 UTC. Base: BUILD 000 branch `feat/build-000-foundation`, commit `2b8886d2b85b982dffbfb087de630573b03bff91`. Work is isolated on `feat/build-001-drawing`; PR #1 and its branch remain unchanged. No merge or release is authorized. This is a functional drawing slice with outstanding native verification, not a declaration of full BUILD 001 acceptance.

## Confirmed local evidence

Environment: Linux x64 managed cloud workspace, Node 24.19.0, Chromium 154.0.8037.57, Playwright 1.64.1. The browser uses the real React frontend; the final rerun builds production assets and serves them with Vite preview; it is **not** the Tauri native window.

| Check                                                                 | Actual result                                                                                                                                                                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run check`                                                       | Passed: TypeScript, ESLint, Prettier, **25 unit/protocol tests**, MCP and frontend JavaScript builds, production license policy (100 dependencies)                                                                       |
| `KREYNIMA_CHROMIUM=/usr/bin/chromium npm run test:ui`                 | **3 passed**: pointer drawing, colors/widths, layers/visibility/order/rename, selected-layer erasing, whole-gesture undo/redo, dots, canceled gestures, hidden-layer rejection, scaled coordinates and redo invalidation |
| `npm audit --audit-level=high`                                        | Passed: 0 known vulnerabilities reported at this observation; not a complete-security claim                                                                                                                              |
| `cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check` | Passed; Rust source was not changed                                                                                                                                                                                      |
| `cargo deny ... check licenses bans sources`                          | Passed; existing duplicate/unused-allowance warnings remain informational                                                                                                                                                |
| Full unfiltered Rust capture + actual advisory gate                   | Scanner exit **1**, one finding; companion gate exit **1**, `accepted: false`, `exceptionUsed: false`, reason “Dependency, workflow, graph, or advisory state changed”                                                   |
| `actionlint` 1.7.7                                                    | Passed, including the new browser-test CI job                                                                                                                                                                            |
| Native `npm run desktop` attempt on this Linux executor               | **Failed before a native window**: Cargo/Tauri reported code 101; missing `gobject-2.0`/GLib development libraries. `pkg-config` also reports GTK/WebKit development libraries absent. No native launch is claimed       |
| Windows/macOS interactive drawing tests                               | **Not run**: no such interactive environments are attached. BUILD 000 smoke records cover the old UI only                                                                                                                |

Browser evidence: [actual Chromium drawing session screenshot](evidence/build-001/chromium-drawing.png). The screenshot was produced by the first automated browser test after real pointer gestures and inspected visually; it shows the overlapping blue and red strokes and reordered named layers. It is browser evidence only. CI uploads browser screenshots/traces under `drawing-browser-evidence`; test failures remain blocking.

The first browser run passed 2/3 tests; the hidden-layer assertion failed because an unqualified status selector also matched the brush-size output. The status region now has an accessible name and the test uses it. The cancellation test also now starts a real captured mouse gesture before cancellation. The corrected development-server rerun passed all three. The final rerun also passed all three against built production assets via Vite preview, including reload resetting the temporary project and undo state. The UI test configuration now exercises that production build in CI. No product failure is hidden by retries or test suppression.

The 25 unit/protocol tests include strict model/schema rejection, duplicate IDs and references, geometry and aggregate limits, detached snapshots, revision conflicts, atomic failure, layer operations, swept eraser geometry, history/redo (including dense-snapshot pruning by aggregate point budget), two isolated sessions, and real stdio MCP/engine parity for every command type. Unknown shell/Python/exec tools and injected fields remain rejected. These tests do not establish complete security or ChatGPT/Claude product compatibility.

## Hosted evidence at the first implementation commit

PR [run 39643827163](https://github.com/bwd-studio/kreynima/actions/runs/39643827163), commit `10c4c9971b31539eb6baaaf1c27a31d98457c948`, was inspected through the GitHub Actions API. JavaScript jobs on Ubuntu (119374041509), Windows (119374041740) and macOS (119374041554) completed **success**; browser UI job 119374041129 completed **success**. Native Windows/macOS jobs and the Rust dependency job were still running at this observation. This is evidence for that exact commit, not a claim that later runs passed. The follow-up changes tighten production-browser/reload and history-budget tests without changing drawing implementation. Final branch checks must be inspected separately before acceptance.

## Dependency/security disposition

No Rust dependency, `deny.toml`, scope fingerprint or activation boolean was changed. The BUILD 000 advisory acceptance applies only to its approved dependency state and scope. New BUILD 001 source, tests and workflow changes invalidate that fingerprint. The security test now requires a changed scope to stay disabled and verifies the actual changed state is rejected by the old gate. It does **not** refresh the scope or inherit acceptance.

RUSTSEC-2024-0370 (`proc-macro-error` 1.0.4) remains unremediated. Full unfiltered advisory evidence, independently blocking licenses/bans/sources, expiry checks and other security checks are preserved. The advisory job is expected to remain blocking for this changed, unapproved scope. No exception, variable, filter, ignore or branch-protection bypass was activated. See the [foundation investigation](dependencies/RUSTSEC-2024-0370.md). Any new disposition needs separate maintainer review; neither BUILD 001 authorization nor the older risk approval authorizes that activation.

Zod was already in the locked production dependency tree; the schema packages now declare it directly. The only added development tool is Playwright with Apache-2.0 license (including playwright/playwright-core; optional fsevents is MIT). Production license inventory remains 100 packages. No paid service, local AI model, remote executable content or broader native permission was added. Existing GPLv3 and conservative trademark/brand policies remain unchanged; release/legal obligations are not waived.

## Required before accepting this slice

1. Accept the BUILD 000 foundation separately. Keep the BUILD 001 PR draft and based on that branch until it can be safely retargeted after foundation acceptance.
2. Review current hosted CI on this branch: Linux/Windows/macOS JavaScript checks, browser UI job, Windows/macOS native compile/test/build, and full dependency/security evidence. A previous foundation green status is not evidence for this slice.
3. Perform and record the [native drawing smoke procedure](build-001.md#try-it-visually-on-windows-or-macos) on both Windows and macOS. Include dev and built executable, exact OS/arch/commit and startup/close behavior. Test pen/touch separately before claiming hardware support.
4. Resolve the Rust advisory or review a new disposition for the changed scope without hiding it. Preserve all other blocking findings and governance gates.
5. Obtain maintainer code review and separate merge authorization. Persistence, animated frames/exposures, live desktop MCP pairing and release packaging remain future work; drawings are currently temporary.
