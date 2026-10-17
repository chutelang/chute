#!/bin/bash
set -Eeuo pipefail

readonly CHUTE_PNPM_VERSION="11.2.2"
readonly CHUTE_MOUNTED_REPO="/Volumes/My Shared Files/chute"
readonly CHUTE_MOUNTED_ARTIFACTS="${CHUTE_SHORTCUT_ARTIFACTS:-}"
readonly CHUTE_RUN_ID="${CHUTE_TEST_RUN_ID:-manual-$$}"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

[[ "$CHUTE_RUN_ID" =~ ^[A-Za-z0-9_-]+$ ]] || {
  echo "error: invalid CHUTE_TEST_RUN_ID: $CHUTE_RUN_ID" >&2
  exit 1
}
[[ -f "$CHUTE_MOUNTED_ARTIFACTS/manifest.json" ]] || {
  echo "error: signed shortcut artifact manifest is unavailable" >&2
  exit 1
}
command -v node >/dev/null || {
  echo "error: Node.js is unavailable in the Tart guest" >&2
  exit 1
}
command -v rsync >/dev/null || {
  echo "error: rsync is unavailable in the Tart guest" >&2
  exit 1
}

CHUTE_LOCAL_REPO="$(mktemp -d "${TMPDIR:-/tmp}/chute-shortcuts-$CHUTE_RUN_ID.XXXXXX")"
cleanup() {
  local status=$?
  trap - EXIT INT TERM
  rm -rf "$CHUTE_LOCAL_REPO"
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.pnpm-store/' \
  --exclude='dist/' \
  --exclude='coverage/' \
  --exclude='.turbo/' \
  --exclude='docs/.vitepress/cache/' \
  --exclude='tools/simulator-test/.tmp/' \
  "$CHUTE_MOUNTED_REPO/" "$CHUTE_LOCAL_REPO/"
cd "$CHUTE_LOCAL_REPO"
export CI=true

CHUTE_PNPM=()
if command -v pnpm >/dev/null && [[ "$(pnpm --version)" == "$CHUTE_PNPM_VERSION" ]]; then
  CHUTE_PNPM=(pnpm)
elif command -v corepack >/dev/null; then
  CHUTE_PNPM=(corepack pnpm)
elif command -v npx >/dev/null; then
  CHUTE_PNPM=(npx --yes "pnpm@$CHUTE_PNPM_VERSION")
else
  echo "error: pnpm $CHUTE_PNPM_VERSION is unavailable and neither Corepack nor npm/npx can provide it" >&2
  exit 1
fi

ACTUAL_PNPM_VERSION="$("${CHUTE_PNPM[@]}" --version)"
[[ "$ACTUAL_PNPM_VERSION" == "$CHUTE_PNPM_VERSION" ]] || {
  echo "error: expected pnpm $CHUTE_PNPM_VERSION, found $ACTUAL_PNPM_VERSION" >&2
  exit 1
}

"${CHUTE_PNPM[@]}" install --frozen-lockfile --ignore-scripts
node --experimental-strip-types \
  tools/simulator-test/run-guest-vitest.ts \
  "$CHUTE_MOUNTED_ARTIFACTS/manifest.json" \
  "${CHUTE_PNPM[@]}"
