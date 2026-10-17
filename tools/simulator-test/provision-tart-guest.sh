#!/bin/bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
[[ "$(uname -s)" == Darwin && "$(uname -m)" == arm64 ]] || {
  echo "Run this script inside the Apple Silicon macOS Tart guest." >&2
  exit 1
}
command -v shortcuts >/dev/null || {
  echo "The Shortcuts CLI is unavailable in this macOS image." >&2
  exit 1
}
command -v node >/dev/null || {
  echo "Install Node.js 22 or newer before sealing the base image." >&2
  exit 1
}

sudo systemsetup -setremotelogin on
if command -v pnpm >/dev/null && [[ "$(pnpm --version)" == "11.2.2" ]]; then
  :
elif command -v corepack >/dev/null; then
  corepack enable
  corepack prepare pnpm@11.2.2 --activate
elif command -v npm >/dev/null; then
  sudo npm install --global pnpm@11.2.2
else
  echo "Cannot install pnpm 11.2.2: npm and Corepack are unavailable." >&2
  exit 1
fi

[[ "$(pnpm --version)" == "11.2.2" ]] || {
  echo "Expected pnpm 11.2.2 after installation, found $(pnpm --version)." >&2
  exit 1
}
open -a Shortcuts

cat <<'MESSAGE'
Guest command-line prerequisites are ready.

Before stopping and cloning this VM:
1. Keep this guest on a local account and signed out of iCloud.
2. Disable the screen saver, lock timeout, and sleep.
3. Enable automatic login for the guest account.
4. Run one Shortcuts test over SSH. macOS will request UI scripting access the first time.
5. In System Settings > Privacy & Security > Accessibility, allow the process macOS identifies for the SSH-driven osascript invocation.
6. Re-run the test over SSH and confirm that it can click Add Shortcut. The runner will also grant the SSH wrapper's Automation request for Shortcuts through the consent dialog's default action; you can grant it manually instead.
7. Confirm a shortcut containing a Chute function runs and returns its expected output.
8. Shut down the VM, then clone or rename it as chute-macos-base.
MESSAGE
