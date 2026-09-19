#!/usr/bin/env node
//
// Simulator shortcut test harness.
//
// Compiles Chute source with `chute build`, imports the signed shortcut
// into the iOS Simulator, runs it, and reads the result from the clipboard.
//
// Each test's Chute source gets a `Device.copyToClipboard()` call appended
// so the result lands in the clipboard for us to read.
//
// Prerequisites:
//   - macOS with Xcode and `shortcuts` CLI
//   - A booted iOS Simulator
//   - `chute` CLI built: `pnpm build`
//   - `mobilecli` available (installed via mobile-mcp or npx)
//
// Usage:
//   node tools/simulator-test/run.js
//

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..", "..");
const TMP_DIR = path.join(__dirname, ".tmp");
const CLI_PATH = path.join(REPO_ROOT, "packages/cli/dist/cli.js");

const SENTINEL = "__CHUTE_TEST_WAITING__";
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 15000;

// ---------------------------------------------------------------------------
// mobilecli resolution
// ---------------------------------------------------------------------------

function findMobilecli() {
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const arch = process.arch === "x64" ? "amd64" : process.arch;
  const ext = platform === "windows" ? ".exe" : "";
  const binaryName = `mobilecli-${platform}-${arch}${ext}`;

  // Walk up from the npx cache looking for the binary
  const npxDir = path.join(
    process.env.HOME,
    ".npm",
    "_npx",
  );
  if (fs.existsSync(npxDir)) {
    for (const entry of fs.readdirSync(npxDir)) {
      const candidate = path.join(
        npxDir,
        entry,
        "node_modules",
        "mobilecli",
        "bin",
        binaryName,
      );
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  // Fallback: assume it's on PATH
  try {
    execFileSync("which", [binaryName], { stdio: "pipe" });
    return binaryName;
  } catch {
    throw new Error(
      `mobilecli not found. Install mobile-mcp: npx @mobilenext/mobile-mcp@latest`,
    );
  }
}

let _mobilecliPath;
function mobilecliPath() {
  if (!_mobilecliPath) _mobilecliPath = findMobilecli();
  return _mobilecliPath;
}

// ---------------------------------------------------------------------------
// mobilecli helpers
// ---------------------------------------------------------------------------

function mobilecli(...args) {
  const result = spawnSync(mobilecliPath(), args, {
    stdio: "pipe",
    timeout: 30000,
  });
  return result.stdout?.toString().trim() ?? "";
}

function dumpUI(deviceId) {
  const raw = mobilecli("dump", "ui", "--device", deviceId);
  return JSON.parse(raw);
}

function findElement(deviceId, label) {
  const dump = dumpUI(deviceId);
  const elements = dump.data?.elements ?? [];
  return flatFind(elements, label);
}

function flatFind(elements, label) {
  for (const el of elements) {
    if (el.label === label || el.name === label) return el;
    if (el.children) {
      const found = flatFind(el.children, label);
      if (found) return found;
    }
  }
  return null;
}

function tap(deviceId, x, y) {
  mobilecli("io", "tap", "--device", deviceId, `${Math.round(x)},${Math.round(y)}`);
}

function tapElement(deviceId, label, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = findElement(deviceId, label);
    if (el?.rect) {
      const cx = el.rect.x + el.rect.width / 2;
      const cy = el.rect.y + el.rect.height / 2;
      tap(deviceId, cx, cy);
      return true;
    }
    sleepSync(500);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Wraps each test's source with Device.copyToClipboard so the last variable
// lands in the clipboard.
// ---------------------------------------------------------------------------

function wrapSource(source) {
  // Find the last `const` or `let` variable name
  const matches = [...source.matchAll(/\b(?:const|let)\s+([a-zA-Z_]\w*)/g)];
  if (matches.length === 0) {
    throw new Error("Test source must declare at least one variable");
  }
  const lastVar = matches[matches.length - 1][1];

  // Insert `import Device;` before the shortcut block if not already present
  let modified = source;
  if (!modified.includes("import Device")) {
    modified = `import Device;\n${modified}`;
  }

  return `${modified}\nDevice.copyToClipboard(${lastVar});`;
}

// ---------------------------------------------------------------------------
// simctl helpers
// ---------------------------------------------------------------------------

function getBootedDeviceUdid() {
  const result = spawnSync("xcrun", ["simctl", "list", "devices", "booted"], {
    stdio: "pipe",
    timeout: 10000,
  });
  const match = result.stdout?.toString().match(/\(([0-9A-F-]{36})\) \(Booted\)/);
  if (!match) {
    throw new Error("No booted Simulator found");
  }
  return match[1];
}

function simctl(...args) {
  const result = spawnSync("xcrun", ["simctl", ...args], {
    stdio: "pipe",
    timeout: 30000,
  });
  return {
    status: result.status,
    stdout: result.stdout?.toString().trim() ?? "",
    stderr: result.stderr?.toString().trim() ?? "",
  };
}

function pbcopy(text) {
  const result = spawnSync("xcrun", ["simctl", "pbcopy", "booted"], {
    input: text,
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 5000,
  });
  if (result.status !== 0) {
    throw new Error(`pbcopy failed: ${result.stderr?.toString()}`);
  }
}

function pbpaste() {
  const result = simctl("pbpaste", "booted");
  if (result.status !== 0) {
    throw new Error(`pbpaste failed: ${result.stderr}`);
  }
  return result.stdout;
}

function openurl(url) {
  const result = simctl("openurl", "booted", url);
  if (result.status !== 0) {
    throw new Error(`openurl failed: ${result.stderr}`);
  }
}

function sleepSync(ms) {
  spawnSync("sleep", [String(ms / 1000)]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollClipboard(timeoutMs, deviceId) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // Dismiss permission dialogs (clipboard access, etc.) on every poll
    if (deviceId) dismissPermissionDialogs(deviceId);
    const content = pbpaste();
    if (content !== SENTINEL) {
      return content;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildShortcut(chuteSource, shortcutName) {
  const srcFile = path.join(TMP_DIR, `${shortcutName}.chute`);
  fs.writeFileSync(srcFile, wrapSource(chuteSource));

  const result = spawnSync("node", [CLI_PATH, "build", srcFile], {
    stdio: "pipe",
    timeout: 30000,
    cwd: REPO_ROOT,
  });

  const stderr = result.stderr?.toString().trim() ?? "";
  if (result.status !== 0) {
    throw new Error(`chute build failed: ${stderr}`);
  }

  const mainPath = path.join(TMP_DIR, `${shortcutName}.shortcut`);
  if (!fs.existsSync(mainPath)) {
    const plistPath = path.join(TMP_DIR, `${shortcutName}.plist`);
    if (fs.existsSync(plistPath)) {
      throw new Error("chute build produced .plist instead of .shortcut — is signing available?");
    }
    throw new Error(`Expected output at ${mainPath} but not found. stdout: ${result.stdout?.toString()}`);
  }

  // Collect sub-shortcuts (functions compile to separate .shortcut files)
  const allFiles = fs.readdirSync(TMP_DIR)
    .filter((f) => f.endsWith(".shortcut") && f !== `${shortcutName}.shortcut`)
    .map((f) => path.join(TMP_DIR, f));

  return { main: mainPath, subShortcuts: allFiles };
}

// ---------------------------------------------------------------------------
// Import a shortcut into the Simulator
// ---------------------------------------------------------------------------

async function importShortcut(signedPath, shortcutName, deviceId) {
  // Open the signed shortcut via file:// URL using the HOST filesystem path.
  // The Simulator can access the host's filesystem directly.
  openurl(`file://${signedPath}`);

  // Wait for the import dialog to appear and settle, then tap "Add Shortcut"
  // (or "Update Shortcut" if it already exists). Retry taps because the
  // button can appear in the accessibility tree before the animation finishes.
  const start = Date.now();
  let found = false;
  while (Date.now() - start < 15000) {
    try {
      const btn = findElement(deviceId, "Add Shortcut") ?? findElement(deviceId, "Update Shortcut");
      if (btn?.rect) {
        if (!found) {
          // First sighting — let the dialog animation finish
          found = true;
          sleepSync(800);
        }
        tap(deviceId, btn.rect.x + btn.rect.width / 2, btn.rect.y + btn.rect.height / 2);
        sleepSync(1000);

        // Verify it was dismissed (button should be gone)
        const still = findElement(deviceId, "Add Shortcut") ?? findElement(deviceId, "Update Shortcut");
        if (!still?.rect) return; // success
        // Otherwise retry the tap
      }
    } catch {
      // dump ui can fail transiently during transitions
    }
    sleepSync(500);
  }
  throw new Error("Timed out waiting for 'Add Shortcut' button");
}

// ---------------------------------------------------------------------------
// Handle runtime permission dialogs (e.g. clipboard access, output)
//
// These are system alerts NOT visible in the accessibility tree, so we tap
// at known fixed coordinates.  Two dialogs may appear on first run:
//
//   1. Clipboard permission ("Allow … to copy to the clipboard?")
//      - Two buttons side-by-side near top: "Don't Allow" | "Allow"
//      - "Allow" center ≈ device (290, 175)
//
//   2. Output permission ("Allow … to output N items?")
//      - Three stacked buttons: "Don't Allow" | "Allow Once" | "Always Allow"
//      - "Always Allow" center ≈ device (201, 560)
// ---------------------------------------------------------------------------

function dismissPermissionDialogs(deviceId) {
  // Tap "Allow" for clipboard permission (top-right area)
  tap(deviceId, 290, 175);
  sleepSync(400);
  // Tap "Always Allow" for output permission (bottom stacked button)
  tap(deviceId, 201, 560);
  sleepSync(400);
}

// ---------------------------------------------------------------------------
// Clean up stale dialogs/state between tests
// ---------------------------------------------------------------------------

function cleanupBetweenTests(deviceId) {
  // Press HOME to dismiss any open dialogs/editors
  mobilecli("io", "button", "--device", deviceId, "HOME");
  sleepSync(500);
  // Dismiss any stale alert dialogs (OK/Cancel buttons)
  const el = findElement(deviceId, "OK");
  if (el?.rect) {
    tap(deviceId, el.rect.x + el.rect.width / 2, el.rect.y + el.rect.height / 2);
    sleepSync(300);
  }
}

// ---------------------------------------------------------------------------
// Run a single test
// ---------------------------------------------------------------------------

async function runTest(testCase, deviceId) {
  const { name, source, expected } = testCase;
  const shortcutName = `ChuteTest_${name.replace(/[^a-zA-Z0-9]/g, "")}`;

  try {
    // 0. Clean up stale state and old build artifacts
    cleanupBetweenTests(deviceId);
    for (const f of fs.readdirSync(TMP_DIR)) {
      if (f.endsWith(".shortcut")) fs.unlinkSync(path.join(TMP_DIR, f));
    }

    // 1. Build and sign
    const { main: mainPath, subShortcuts } = buildShortcut(source, shortcutName);

    // 2. Import sub-shortcuts first (functions), then the main shortcut
    for (const sub of subShortcuts) {
      await importShortcut(sub, path.basename(sub, ".shortcut"), deviceId);
    }
    await importShortcut(mainPath, shortcutName, deviceId);

    // 3. Set clipboard sentinel
    pbcopy(SENTINEL);

    // 4. Run
    openurl(`shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`);

    // 5. Poll clipboard (also dismisses permission dialogs each iteration)
    const result = await pollClipboard(POLL_TIMEOUT_MS, deviceId);

    if (result === null) {
      return { name, status: "TIMEOUT", expected, actual: null };
    }

    const trimmedResult = result.trim();
    const trimmedExpected = expected.trim();

    if (trimmedResult === trimmedExpected) {
      return { name, status: "PASS", expected: trimmedExpected, actual: trimmedResult };
    }
    return { name, status: "FAIL", expected: trimmedExpected, actual: trimmedResult };
  } catch (err) {
    return { name, status: "ERROR", expected, actual: err.message };
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function getAnyDeviceUdid() {
  const result = spawnSync("xcrun", ["simctl", "list", "devices", "available"], {
    stdio: "pipe",
    timeout: 10000,
  });
  const match = result.stdout?.toString().match(/\(([0-9A-F-]{36})\) \((Booted|Shutdown)\)/);
  if (!match) throw new Error("No available iOS Simulator found");
  return { udid: match[1], state: match[2] };
}

function resetSimulator() {
  const { udid, state } = getAnyDeviceUdid();

  // Shutdown if booted
  if (state === "Booted") {
    process.stdout.write("Shutting down Simulator... ");
    simctl("shutdown", udid);
    console.log("done");
  }

  // Erase all content and settings
  process.stdout.write("Erasing Simulator... ");
  simctl("erase", udid);
  console.log("done");

  // Boot
  process.stdout.write("Booting Simulator... ");
  simctl("boot", udid);
  // Wait for boot to complete
  spawnSync("xcrun", ["simctl", "bootstatus", udid, "-b"], {
    stdio: "pipe",
    timeout: 120000,
  });
  console.log("done");

  // Install mobilecli agent
  process.stdout.write("Installing mobilecli agent... ");
  mobilecli("agent", "install", "--device", udid);
  // Kick backboardd so the WebDriverAgent runner starts cleanly
  spawnSync("xcrun", ["simctl", "spawn", "booted", "launchctl", "kickstart", "-k",
    "system/com.apple.backboardd"], { stdio: "pipe", timeout: 10000 });
  sleepSync(3000);
  console.log("done");

  // Wait for agent to be responsive
  process.stdout.write("Waiting for agent");
  let agentReady = false;
  for (let i = 0; i < 15; i++) {
    try {
      const raw = mobilecli("dump", "ui", "--device", udid);
      JSON.parse(raw);
      agentReady = true;
      break;
    } catch {
      process.stdout.write(".");
      sleepSync(3000);
    }
  }
  if (!agentReady) {
    console.error(" FAILED");
    console.error("mobilecli agent not responding after install.");
    process.exit(1);
  }
  console.log(" ready");

  return udid;
}

async function main() {
  const signCheck = spawnSync("shortcuts", ["sign", "--help"], { stdio: "pipe", timeout: 5000 });
  if (signCheck.status !== 0) {
    console.error("'shortcuts' CLI not available. This tool requires macOS.");
    process.exit(1);
  }

  if (!fs.existsSync(CLI_PATH)) {
    console.error("Chute CLI not built. Run: pnpm build");
    process.exit(1);
  }

  try {
    mobilecliPath();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const deviceId = resetSimulator();

  fs.mkdirSync(TMP_DIR, { recursive: true });

  console.log(`Device: ${deviceId}`);

  const testCasesPath = path.join(__dirname, "test-cases.json");
  const testCases = JSON.parse(fs.readFileSync(testCasesPath, "utf-8"));

  console.log(`Running ${testCases.length} test(s)...\n`);

  const results = [];
  for (const tc of testCases) {
    process.stdout.write(`  ${tc.name} ... `);
    const result = await runTest(tc, deviceId);
    results.push(result);

    if (result.status === "PASS") {
      console.log("PASS");
    } else if (result.status === "TIMEOUT") {
      console.log("TIMEOUT (clipboard never changed)");
    } else if (result.status === "ERROR") {
      console.log(`ERROR: ${result.actual}`);
    } else {
      console.log(`FAIL\n    expected: ${result.expected}\n    actual:   ${result.actual}`);
    }
  }

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status !== "PASS").length;
  console.log(`\n${passed} passed, ${failed} failed out of ${results.length}`);

  const resultsPath = path.join(__dirname, "results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${resultsPath}`);

  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
