#!/bin/bash
set -Eeuo pipefail

CHUTE_TART_BASE_IMAGE="${CHUTE_TART_BASE:-chute-macos-base}"
CHUTE_TART_GUEST_USER="${CHUTE_TART_USER:-admin}"
CHUTE_TART_GUEST_PASSWORD="${CHUTE_TART_PASSWORD:-admin}"
CHUTE_TART_KEEP_VM_ON_FAILURE="${CHUTE_TART_KEEP_VM_ON_FAILURE:-0}"
CHUTE_TART_CLONE="chute-test-$(id -un | tr -cd 'A-Za-z0-9_-')-$(date +%Y%m%d%H%M%S)-$$"
CHUTE_REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHUTE_ARTIFACT_DIR=""
CHUTE_TART_RUN_PID=""
CHUTE_TART_CREATED=0
CHUTE_TART_LOG=""

fail() {
  echo "error: $*" >&2
  exit 1
}

cleanup() {
  local status=$?
  trap - EXIT INT TERM
  if [[ "$status" != 0 && "$CHUTE_TART_KEEP_VM_ON_FAILURE" == 1 && "$CHUTE_TART_CREATED" == 1 ]]; then
    printf '\nPreserving failed Tart VM for debugging.\n' >&2
    printf 'VM name: %s\n' "$CHUTE_TART_CLONE" >&2
    printf 'VM IP: %s\n' "${CHUTE_TART_IP:-unavailable}" >&2
    printf 'Tart log: %s\n' "${CHUTE_TART_LOG:-unavailable}" >&2
    printf "Restart: tart run --no-graphics --dir='chute:%s:ro' --dir='artifacts:%s:ro' '%s'\n" \
      "$CHUTE_REPO_ROOT" \
      "$CHUTE_ARTIFACT_DIR" \
      "$CHUTE_TART_CLONE" >&2
    printf "Cleanup: tart stop '%s' && tart delete '%s' && rm -rf -- '%s'\n" \
      "$CHUTE_TART_CLONE" \
      "$CHUTE_TART_CLONE" \
      "$CHUTE_ARTIFACT_DIR" >&2
    if [[ -n "$CHUTE_TART_RUN_PID" ]]; then
      disown "$CHUTE_TART_RUN_PID" 2>/dev/null || true
    fi
    exit "$status"
  fi
  if [[ "$CHUTE_TART_CREATED" == 1 && "$CHUTE_TART_CLONE" == chute-test-* ]]; then
    tart stop "$CHUTE_TART_CLONE" >/dev/null 2>&1 || true
    if [[ -n "$CHUTE_TART_RUN_PID" ]]; then
      wait "$CHUTE_TART_RUN_PID" 2>/dev/null || true
    fi
    tart delete "$CHUTE_TART_CLONE" >/dev/null 2>&1 || true
  fi
  if [[ -n "$CHUTE_ARTIFACT_DIR" && "$(basename "$CHUTE_ARTIFACT_DIR")" == chute-shortcuts-artifacts.* ]]; then
    rm -rf "$CHUTE_ARTIFACT_DIR"
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

[[ "$CHUTE_TART_KEEP_VM_ON_FAILURE" == 0 || "$CHUTE_TART_KEEP_VM_ON_FAILURE" == 1 ]] || \
  fail "CHUTE_TART_KEEP_VM_ON_FAILURE must be 0 or 1"

[[ "$(uname -s)" == Darwin ]] || fail "Tart tests require a macOS host"
[[ "$(uname -m)" == arm64 ]] || fail "Tart tests require Apple Silicon"
command -v tart >/dev/null || fail "Tart is not installed. Run: brew install cirruslabs/cli/tart"
command -v node >/dev/null || fail "Node.js is required on the host"
command -v pnpm >/dev/null || fail "pnpm is required on the host. Run: corepack enable"
command -v shortcuts >/dev/null || fail "The macOS Shortcuts CLI is required on the host"
command -v sshpass >/dev/null || fail "sshpass is not installed. Run: brew install cirruslabs/cli/sshpass"
CHUTE_HOST_NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
((CHUTE_HOST_NODE_MAJOR >= 22)) || fail "Node.js 22 or newer is required on the host"
[[ "$(pnpm --version)" == 11.2.2 ]] || fail "pnpm 11.2.2 is required on the host"

if ! tart list --format json | CHUTE_EXPECTED_VM="$CHUTE_TART_BASE_IMAGE" node -e '
  let input = "";
  process.stdin.on("data", chunk => input += chunk);
  process.stdin.on("end", () => {
    const entries = JSON.parse(input);
    const found = entries.some(entry => (entry.Name ?? entry.name) === process.env.CHUTE_EXPECTED_VM);
    process.exit(found ? 0 : 1);
  });
'; then
  fail "Tart base image not found: $CHUTE_TART_BASE_IMAGE"
fi

CHUTE_ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/chute-shortcuts-artifacts.XXXXXX")"
printf 'Building and signing shortcut test artifacts...\n'
pnpm --dir "$CHUTE_REPO_ROOT" --filter @chutelang/cli build
node --experimental-strip-types \
  "$CHUTE_REPO_ROOT/tools/simulator-test/prepare-artifacts.ts" \
  "$CHUTE_ARTIFACT_DIR" \
  "$CHUTE_TART_CLONE" \
  "$@"

printf 'Cloning %s as %s...\n' "$CHUTE_TART_BASE_IMAGE" "$CHUTE_TART_CLONE"
CHUTE_TART_CREATED=1
tart clone "$CHUTE_TART_BASE_IMAGE" "$CHUTE_TART_CLONE"

start_tart_guest() {
  if [[ "$CHUTE_TART_KEEP_VM_ON_FAILURE" == 1 ]]; then
    CHUTE_TART_LOG="$CHUTE_ARTIFACT_DIR/tart-run.log"
    nohup tart run \
      --no-graphics \
      --dir="chute:$CHUTE_REPO_ROOT:ro" \
      --dir="artifacts:$CHUTE_ARTIFACT_DIR:ro" \
      "$CHUTE_TART_CLONE" </dev/null >>"$CHUTE_TART_LOG" 2>&1 &
  else
    tart run \
      --no-graphics \
      --dir="chute:$CHUTE_REPO_ROOT:ro" \
      --dir="artifacts:$CHUTE_ARTIFACT_DIR:ro" \
      "$CHUTE_TART_CLONE" &
  fi
  CHUTE_TART_RUN_PID=$!
}

start_tart_guest

CHUTE_TART_IP=""
CHUTE_TART_READY=0
for _ in $(seq 1 120); do
  CHUTE_TART_IP="$(tart ip "$CHUTE_TART_CLONE" 2>/dev/null || true)"
  if [[ -n "$CHUTE_TART_IP" ]] && sshpass -p "$CHUTE_TART_GUEST_PASSWORD" ssh \
    -o ConnectTimeout=2 \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    "$CHUTE_TART_GUEST_USER@$CHUTE_TART_IP" true >/dev/null 2>&1; then
    CHUTE_TART_READY=1
    break
  fi
  sleep 1
done
[[ "$CHUTE_TART_READY" == 1 ]] || fail "Tart guest did not become reachable over SSH"

sshpass -p "$CHUTE_TART_GUEST_PASSWORD" ssh \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$CHUTE_TART_GUEST_USER@$CHUTE_TART_IP" \
  "export PATH='/opt/homebrew/bin:/usr/local/bin':\$PATH; \
   export CHUTE_TEST_RUN_ID='$CHUTE_TART_CLONE'; \
   export CHUTE_SHORTCUT_ARTIFACTS='/Volumes/My Shared Files/artifacts'; \
   bash '/Volumes/My Shared Files/chute/tools/simulator-test/guest-run.sh'"
