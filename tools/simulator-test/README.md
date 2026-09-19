# Simulator Test Harness

Compiles Chute source to signed shortcuts, imports them into the iOS Simulator, runs them, and validates the output via the clipboard.

## How it works

1. Erases and reboots the iOS Simulator (skipped if already booted with agent)
2. Installs the mobilecli agent for UI automation
3. For each test case:
   - Compiles Chute source with `chute build` (produces signed `.shortcut`)
   - Appends `Device.copyToClipboard(lastVar)` to capture output
   - Imports into the Simulator via `file://` URL + taps "Add Shortcut"
   - Runs via `shortcuts://run-shortcut` URL scheme
   - Dismisses clipboard/output permission dialogs
   - Reads the result from the Simulator's clipboard
   - Compares against the expected value

## Prerequisites

- macOS with Xcode and `shortcuts` CLI
- An iOS Simulator (will be auto-booted)
- The compiler built: `pnpm build`
- mobilecli: `npx @mobilenext/mobile-mcp@latest` (run once to install)

## Usage

Run all tests:
```bash
npx vitest run tools/simulator-test/simulator.test.ts
```

Run a specific test by name:
```bash
npx vitest run tools/simulator-test/simulator.test.ts -t "text-literal"
npx vitest run tools/simulator-test/simulator.test.ts -t "arithmetic"
```

Force a fresh simulator reset:
```bash
SIM_RESET=1 npx vitest run tools/simulator-test/simulator.test.ts
```

Legacy runner (runs all tests, always resets):
```bash
node tools/simulator-test/run.js
```

## Adding test cases

Edit `test-cases.json`. Each entry has:

- `name`: short identifier for the test (used with `-t` for targeting)
- `source`: Chute source code (must include `shortcut { name: "Test" }`)
- `expected`: the exact string the shortcut should copy to the clipboard

## Limitations

- Actions that require user interaction (prompts, pickers) will hang
- Hardware-dependent actions (camera, Bluetooth) will fail
- Permission dialog coordinates are device-specific (calibrated for iPhone 17 Pro)
