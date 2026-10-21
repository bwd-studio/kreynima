# BUILD 000 native smoke test

Run this on a real interactive Windows session and a real interactive macOS session. CI compilation is not evidence of a visible window launch. **Neither manual test has been run by this agent.**

Prerequisites: check out the PR commit being tested, install Node 22.12+ and stable Rust, and follow [platform prerequisites](building.md). Windows needs MSVC/Windows SDK and WebView2; macOS needs Xcode Command Line Tools. Stop other servers using port 1420.

From the repository root, on either OS:

```sh
npm ci
npm run desktop
```

1. Confirm a native window titled **KREYNIMA — Development** opens. Verify **KREYNIMA**, **BUILD 000**, **Development foundation**, and the message that no project is open are visible. A browser tab alone does not pass.
2. Check the terminal for startup errors, crashes, or Rust panic output. Record any errors and blank/missing UI as a failure; do not infer success from the process remaining alive.
3. Close the window normally. Stop the watcher with Ctrl+C if it remains running. Confirm there was no crash/panic and launch once more to verify it can reopen.

For the built executable, also run:

```sh
npm run tauri -w @kreynima/desktop -- build --ci --no-bundle -- --locked
```

Stop the development server, then launch the executable and repeat the three checks above:

Windows PowerShell:

```powershell
& ./apps/desktop/src-tauri/target/release/kreynima-desktop.exe
```

macOS Terminal:

```sh
./apps/desktop/src-tauri/target/release/kreynima-desktop
```

A Windows release build has no console window, so also record any OS crash dialog or Event Viewer Application Error for this executable if one occurs. A visible window and clean close are still required; lack of console output alone proves nothing. This is an unsigned local executable, not an installer or notarized release.

Record actual observations in docs/build-000-validation.md, including exact commit, OS version, CPU architecture, Node/Rust versions, dev/built executable tested, observed window, startup errors, clean close/relaunch, and tester/date. Attach redacted terminal output or screenshots if available. Record failures; leave untested rows unverified.

| Platform                              | Development launch | Built executable launch | Startup errors / close / relaunch |
| ------------------------------------- | ------------------ | ----------------------- | --------------------------------- |
| Windows (record version/architecture) | Not run            | Not run                 | Unverified                        |
| macOS (record version/architecture)   | Not run            | Not run                 | Unverified                        |

A pass covers only that OS/architecture and commit. It does not verify animation features, general compatibility, signing, complete security, or release readiness.
