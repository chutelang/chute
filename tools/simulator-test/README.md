# macOS Shortcuts tests in Tart

The simulator test suite runs shortcuts inside a disposable Tart virtual machine. The host compiles and signs the test files, but it never imports or runs them. Every run clones `chute-macos-base`, mounts this repository and the signed artifacts read-only, executes the guest test suite, and deletes the clone.

## Host requirements

- An Apple Silicon Mac. The intended host is an M4 Pro.
- macOS 13 or newer.
- Tart and sshpass:

```bash
brew install cirruslabs/cli/tart cirruslabs/cli/sshpass
```

- Node.js 22 or newer and pnpm 11.2.2 on the host.
- Installed project dependencies and a host macOS user signed in to iCloud:

```bash
pnpm install
```

The host uses its authenticated Shortcuts CLI only for `shortcuts sign --mode anyone`. It writes signed files to a unique temporary directory and deletes that directory after the run. It never opens a signed file or changes the host Shortcuts library.

Tart exposes the repository and signed artifact directory as separate read-only mounts. The guest runner copies the repository to a unique local temporary directory, excluding host dependencies and build caches. It installs the locked dependencies, runs Vitest, and removes the local copy. Guest package installation never changes host `node_modules`.

## Create the golden image

Start from Cirrus Labs' current macOS Tahoe base:

```bash
tart clone ghcr.io/cirruslabs/macos-tahoe-base:latest chute-macos-setup
tart run --dir="chute:$PWD" chute-macos-setup
```

Complete these steps in the guest before sealing it:

1. Use a local `admin` account. Keep the guest signed out of iCloud.
2. Enable automatic login and Remote Login.
3. Disable the screen saver, lock timeout, and system sleep.
4. Install Node.js 22 or newer. The provisioning script installs pnpm 11.2.2 using an existing pnpm, Corepack, or npm.
5. From the mounted repository, run:

   ```bash
   bash "/Volumes/My Shared Files/chute/tools/simulator-test/provision-tart-guest.sh"
   ```

6. Run the guest test command once over SSH. The first import should trigger Accessibility consent for the SSH-driven `osascript` process.
7. In System Settings > Privacy & Security > Accessibility, enable the process macOS identifies for that request. Run the command again and confirm it can click Add Shortcut.
8. The test runner executes shortcuts through the Shortcuts scripting interface so nested Chute functions run in the Aqua session. Its first run grants the resulting SSH-wrapper-to-Shortcuts Automation request through the system dialog's default action. You may instead grant this Automation permission manually before sealing the image.
9. Shut down the setup VM and create the immutable working base:

   ```bash
   tart stop chute-macos-setup
   tart clone chute-macos-setup chute-macos-base
   ```

Do not use the golden image for ordinary work. Recreate it when macOS, Shortcuts, Node.js, or the permission setup changes.

## Run tests

From the host:

```bash
pnpm test:shortcuts
```

Pass a Vitest test-name pattern to compile and sign only matching shortcuts:

```bash
pnpm test:shortcuts -t arithmetic-add
```

Use another local base image or guest credential with environment variables:

```bash
CHUTE_TART_BASE=my-base CHUTE_TART_USER=admin CHUTE_TART_PASSWORD=admin pnpm test:shortcuts
```

To preserve a failed disposable VM and its signed artifact directory for inspection, opt in for one run:

```bash
CHUTE_TART_KEEP_VM_ON_FAILURE=1 pnpm test:shortcuts -t arithmetic-add
```

The failure output prints the exact VM name, last known IP, restart command (in case the noninteractive parent stops Tart), and cleanup command. Run the printed cleanup command when inspection is complete. Successful runs and all runs without this option retain automatic cleanup.

The host wrapper builds the Chute CLI and applies `-t` or `--testNamePattern` before compiling artifacts. A filtered run compiles and signs only matching tests; a run without a name pattern prepares every test. Each selected test gets a unique workflow name and Stop and Output action. The host writes the signed files and a manifest, verifies Tart, clones the base image, mounts the repository and artifacts read-only, waits for SSH, and starts the guest runner. The guest validates the manifest before importing anything and receives the original Vitest arguments.

EXIT, INT, and TERM traps stop and delete the exact clone and remove the exact host artifact directory. The wrapper never deletes other `chute-test-` machines because concurrent test runs may own them.

If the host is killed without running traps, inspect `tart list` and manually delete only clones whose generated `chute-test-<user>-<timestamp>-<pid>` name belongs to an abandoned run.

## Guest test flow

Before starting Tart, the host prepares up to four independent artifacts concurrently:

1. Rewrites `WFWorkflowName` through the Chute source to a unique name.
2. Adds a Stop and Output action for the last declared variable.
3. Compiles unsigned XML, stages it as `.unsigned.shortcut`, and signs it with `shortcuts sign --mode anyone`. Transient `NSURLErrorDomain` signing failures are retried twice with bounded exponential backoff.
4. Writes the test name, workflow name, signed filename, and expected result to `manifest.json`.

For each manifest entry, the guest copies the signed shortcut from Tart's read-only artifact share to a private local temporary directory. It discovers the active console user and verifies that user's launchd GUI domain, then opens the local document through Launch Services in that Aqua session. The import preview's Add Shortcut button has no accessible name on current macOS, so the guest waits for the untitled import window's content to finish loading, invokes its default action with Return, and waits for the window to close. It verifies the exact imported name with `shortcuts list`, keeps Shortcuts open for the scripted run, then quits it cleanly and waits for its process to exit.

The guest closes every spawned command's stdin pipe explicitly. Vitest runs each imported shortcut through the Shortcuts scripting interface in the console user's Aqua session and compares AppleScript's normalized textual result with the manifest. The runner detects the first Automation consent system dialog and invokes its default action through Accessibility without using coordinates or localized button names. This avoids a macOS `shortcuts run` hang when a generated shortcut uses Run Shortcut for a Chute function call.

If import or execution fails, the test reports the `/dev/console` owner and GUI-domain state, Shortcuts and related processes, every foreground GUI application and background UI agent with windows, bundle identifiers, useful accessible controls, local artifact metadata, and bounded unified logs from Shortcuts, Launch Services, RunningBoard, sandbox, and trust/signature validation.

There is no per-shortcut deletion. Destroying the Tart clone removes the entire Shortcuts library, including state left by a failed test.

## Limitations

- These tests exercise macOS Shortcuts actions and macOS permission behavior, not iOS-specific actions.
- The import automation does not depend on localized button labels.
- Importing a shortcut signed with `shortcuts sign --mode anyone` does not require the guest to have an Apple account or network access. Host-side signing still requires both.
- Shortcuts that display prompts can block the command-line process.
- Stop and Output is coerced to plain text. Tests for files or rich content need a separate output strategy.
- Host signing requires network access and an iCloud-authenticated macOS user.
- Accessibility consent and end-to-end import behavior cannot be validated on Linux.
