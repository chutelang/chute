#!/usr/bin/env bash
# Regenerate the Shortcuts action catalog from macOS system frameworks.
#
#   ./build-and-run.sh          # full run: simulator (390 actions) + intent merge
#   ./build-and-run.sh macos    # macOS-only fallback (338 actions, no ActionKit)
#
# Output lands in ./data/.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data build

MODE="${1:-sim}"

if [[ "$MODE" == "macos" ]]; then
  echo "==> building macOS extractor (WorkflowKit only)"
  clang -fobjc-arc -framework Foundation -o build/extract_macos extract-actions.m
  ./build/extract_macos data/actions_macos.json
  echo "==> wrote data/actions_macos.json"
  exit 0
fi

# ---- simulator route: ActionKit only loads inside the simulator runtime ----
RUNTIME_ID=$(xcrun simctl list runtimes --json | node -e '
const d = JSON.parse(require("fs").readFileSync("/dev/stdin","utf-8"));
const rs = d.runtimes.filter(r => r.isAvailable && r.name.includes("iOS"));
if (!rs.length) { console.error("no available iOS runtime"); process.exit(1); }
rs.sort((a,b) => a.version.localeCompare(b.version, undefined, {numeric:true}));
console.log(rs.at(-1).identifier);')

UDID=$(xcrun simctl list devices --json | node -e "
const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
const devs = (d.devices['$RUNTIME_ID'] || []).filter(x => x.isAvailable);
if (!devs.length) { console.error('no available device for $RUNTIME_ID'); process.exit(1); }
console.log(devs[0].udid);")

echo "==> runtime $RUNTIME_ID  device $UDID"

SDK=$(xcrun --sdk iphonesimulator --show-sdk-path)
SDKVER=$(xcrun --sdk iphonesimulator --show-sdk-version)
echo "==> building simulator extractor (SDK $SDKVER)"
clang -arch arm64 -isysroot "$SDK" -mios-simulator-version-min=17.0 \
      -DLOAD_ACTIONKIT -fobjc-arc -framework Foundation \
      -o build/extract_sim extract-actions.m

BOOTED=0
if ! xcrun simctl list devices | grep -q "$UDID.*Booted"; then
  echo "==> booting simulator"
  xcrun simctl boot "$UDID"
  xcrun simctl bootstatus "$UDID" >/dev/null 2>&1 || true
  BOOTED=1
fi

echo "==> extracting"
xcrun simctl spawn "$UDID" "$PWD/build/extract_sim" "$PWD/data/actions_sim.json"

# ActionKit's SiriKit intent metadata (names/params for the AppIntents-backed actions)
IDEF=$( { find "/Library/Developer/CoreSimulator/Volumes" \
        -path "*ActionKit.framework/Base.lproj/Actions.intentdefinition" 2>/dev/null || true; } | head -1)
if [[ -n "$IDEF" ]]; then
  plutil -convert json -o data/intents.json "$IDEF"
  node merge-intents.js data/actions_sim.json data/intents.json data/chute_actions.json
else
  echo "!! Actions.intentdefinition not found; skipping intent merge" >&2
  cp data/actions_sim.json data/chute_actions.json
fi

if [[ "$BOOTED" == "1" ]]; then
  echo "==> shutting simulator back down"
  xcrun simctl shutdown "$UDID"
fi
echo "==> done: data/chute_actions.json"
