import { describe, test, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DIR = import.meta.dirname;
const REPO_ROOT = path.join(DIR, "..", "..");
const TMP_DIR = path.join(DIR, ".tmp");
const CLI_PATH = path.join(REPO_ROOT, "packages/cli/dist/cli.js");

const SENTINEL = "__CHUTE_TEST_WAITING__";
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 15000;

const DEVICE_TYPE = "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro";
const RUNTIME = "com.apple.CoreSimulator.SimRuntime.iOS-26-5";

// ---------------------------------------------------------------------------
// Async helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exec(
  cmd: string,
  args: string[],
  opts?: { input?: string; timeout?: number; cwd?: string },
): Promise<{ stdout: string; stderr: string }> {
  if (opts?.input !== undefined) {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], cwd: opts?.cwd });
      let stdout = "";
      let stderr = "";
      child.stdout!.on("data", (d: Buffer) => (stdout += d));
      child.stderr!.on("data", (d: Buffer) => (stderr += d));
      child.on("close", (code) => {
        if (code !== 0) reject(new Error(`${cmd} failed (${code}): ${stderr.trim()}`));
        else resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      });
      child.stdin!.end(opts.input);
    });
  }
  const { stdout, stderr } = await execFileAsync(cmd, args, {
    timeout: opts?.timeout ?? 30000,
    maxBuffer: 8 * 1024 * 1024,
    cwd: opts?.cwd,
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

// ---------------------------------------------------------------------------
// mobilecli resolution
// ---------------------------------------------------------------------------

function findMobilecli(): string {
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const arch = process.arch === "x64" ? "amd64" : process.arch;
  const ext = platform === "windows" ? ".exe" : "";
  const binaryName = `mobilecli-${platform}-${arch}${ext}`;

  const npxDir = path.join(process.env.HOME!, ".npm", "_npx");
  if (fs.existsSync(npxDir)) {
    for (const entry of fs.readdirSync(npxDir)) {
      const candidate = path.join(npxDir, entry, "node_modules", "mobilecli", "bin", binaryName);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  throw new Error("mobilecli not found. Install mobile-mcp: npx @mobilenext/mobile-mcp@latest");
}

let _mobilecliPath: string;
function mcli(): string {
  if (!_mobilecliPath) _mobilecliPath = findMobilecli();
  return _mobilecliPath;
}

// ---------------------------------------------------------------------------
// mobilecli async helpers
// ---------------------------------------------------------------------------

async function mobilecli(...args: string[]): Promise<string> {
  const { stdout } = await exec(mcli(), args);
  return stdout;
}

interface UIElement {
  type?: string;
  label?: string;
  name?: string;
  rect?: { x: number; y: number; width: number; height: number };
  children?: UIElement[];
}

async function dumpUI(udid: string): Promise<{ data?: { elements?: UIElement[] } }> {
  return JSON.parse(await mobilecli("dump", "ui", "--device", udid));
}

async function findElement(udid: string, label: string): Promise<UIElement | null> {
  const dump = await dumpUI(udid);
  return flatFind(dump.data?.elements ?? [], label);
}

function flatFind(elements: UIElement[], label: string): UIElement | null {
  for (const el of elements) {
    if (el.label === label || el.name === label) return el;
    if (el.children) {
      const found = flatFind(el.children, label);
      if (found) return found;
    }
  }
  return null;
}

async function tap(udid: string, x: number, y: number): Promise<void> {
  await mobilecli("io", "tap", "--device", udid, `${Math.round(x)},${Math.round(y)}`);
}

// ---------------------------------------------------------------------------
// simctl async helpers
// ---------------------------------------------------------------------------

async function simctl(...args: string[]) {
  try {
    return await exec("xcrun", ["simctl", ...args]);
  } catch (e: any) {
    return { stdout: "", stderr: e.message ?? "" };
  }
}

async function pbcopy(udid: string, text: string): Promise<void> {
  await exec("xcrun", ["simctl", "pbcopy", udid], { input: text });
}

async function pbpaste(udid: string): Promise<string> {
  const { stdout } = await exec("xcrun", ["simctl", "pbpaste", udid]);
  return stdout;
}

async function openurl(udid: string, url: string): Promise<void> {
  await exec("xcrun", ["simctl", "openurl", udid, url]);
}

// ---------------------------------------------------------------------------
// Source wrapping
// ---------------------------------------------------------------------------

function wrapSource(source: string): string {
  const matches = [...source.matchAll(/\b(?:const|let)\s+([a-zA-Z_]\w*)/g)];
  if (matches.length === 0) throw new Error("Test source must declare at least one variable");
  const lastMatch = matches[matches.length - 1]; if (!lastMatch) { throw new Error("no var"); } const lastVar = lastMatch[1];
  let modified = source;
  if (!modified.includes("import Device")) modified = `import Device;\n${modified}`;
  return `${modified}\nDevice.copyToClipboard(${lastVar});`;
}

// ---------------------------------------------------------------------------
// Build (sync — called in parallel via Promise.all before tests run)
// ---------------------------------------------------------------------------

interface BuildResult {
  main: string;
  subShortcuts: string[];
  workDir: string;
}

async function buildShortcut(
  chuteSource: string,
  shortcutName: string,
  workDir: string,
): Promise<BuildResult> {
  fs.mkdirSync(workDir, { recursive: true });

  const srcFile = path.join(workDir, `${shortcutName}.chute`);
  fs.writeFileSync(srcFile, wrapSource(chuteSource));

  await exec("node", [CLI_PATH, "build", srcFile], { timeout: 30000, cwd: REPO_ROOT });

  const mainPath = path.join(workDir, `${shortcutName}.shortcut`);
  if (!fs.existsSync(mainPath)) {
    throw new Error(`Expected output at ${mainPath} but not found`);
  }

  const subShortcuts = fs
    .readdirSync(workDir)
    .filter((f) => f.endsWith(".shortcut") && f !== `${shortcutName}.shortcut`)
    .map((f) => path.join(workDir, f));

  return { main: mainPath, subShortcuts, workDir };
}

// ---------------------------------------------------------------------------
// Import a shortcut into the Simulator
// ---------------------------------------------------------------------------

async function importShortcut(signedPath: string, udid: string): Promise<void> {
  await openurl(udid, `file://${signedPath}`);

  const start = Date.now();
  let found = false;
  while (Date.now() - start < 15000) {
    try {
      const btn =
        (await findElement(udid, "Add Shortcut")) ?? (await findElement(udid, "Update Shortcut"));
      if (btn?.rect) {
        if (!found) {
          found = true;
          await sleep(800);
        }
        await tap(udid, btn.rect.x + btn.rect.width / 2, btn.rect.y + btn.rect.height / 2);
        await sleep(1000);
        const still =
          (await findElement(udid, "Add Shortcut")) ?? (await findElement(udid, "Replace"));
        if (!still?.rect) return;
      }
    } catch {
      // dump ui can fail transiently during transitions
    }
    await sleep(500);
  }
  throw new Error("Timed out waiting for 'Add Shortcut' button");
}

// ---------------------------------------------------------------------------
// Cleanup between tests
// ---------------------------------------------------------------------------

async function cleanupBetweenTests(udid: string): Promise<void> {
  await mobilecli("io", "button", "--device", udid, "HOME");
  await sleep(500);
  try {
    const el = await findElement(udid, "OK");
    if (el?.rect) {
      await tap(udid, el.rect.x + el.rect.width / 2, el.rect.y + el.rect.height / 2);
      await sleep(300);
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Simulator setup
// ---------------------------------------------------------------------------

async function isAgentReady(udid: string): Promise<boolean> {
  try {
    JSON.parse(await mobilecli("dump", "ui", "--device", udid));
    return true;
  } catch {
    return false;
  }
}

async function ensureSimulator(): Promise<string> {
  // Find an iPhone 17 Pro simulator
  const { stdout } = await exec("xcrun", ["simctl", "list", "devices", "available", "-j"]);
  const allDevices = JSON.parse(stdout);
  const runtimeDevices: Array<{ udid: string; name: string; state: string }> =
    allDevices.devices?.[RUNTIME] ?? [];
  const candidate = runtimeDevices.find((d) => d.name.startsWith("iPhone 17 Pro"));
  if (!candidate) throw new Error("No iPhone 17 Pro simulator found");

  const udid = candidate.udid;

  if (candidate.state === "Booted") await simctl("shutdown", udid);
  await simctl("erase", udid);
  await simctl("boot", udid);
  await exec("xcrun", ["simctl", "bootstatus", udid, "-b"], { timeout: 120000 });

  await mobilecli("agent", "install", "--device", udid);
  await exec("xcrun", [
    "simctl",
    "spawn",
    udid,
    "launchctl",
    "kickstart",
    "-k",
    "system/com.apple.backboardd",
  ]);
  await sleep(3000);

  for (let i = 0; i < 15; i++) {
    if (await isAgentReady(udid)) return udid;
    await sleep(3000);
  }
  throw new Error("mobilecli agent not responding after install");
}

// ---------------------------------------------------------------------------
// Run one test case (import + run + read clipboard)
// ---------------------------------------------------------------------------

async function runShortcutTest(
  build: BuildResult,
  shortcutName: string,
  udid: string,
): Promise<string | null> {
  await cleanupBetweenTests(udid);

  // Import sub-shortcuts, then main
  for (const sub of build.subShortcuts) {
    await importShortcut(sub, udid);
  }
  await importShortcut(build.main, udid);

  // Set sentinel and run
  await pbcopy(udid, SENTINEL);
  await openurl(udid, `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`);

  // Dismiss permission dialogs with retries
  for (let i = 0; i < 4; i++) {
    await sleep(1000);
    await tap(udid, 290, 175); // clipboard "Allow"
    await tap(udid, 201, 560); // output "Always Allow"
  }

  // Poll clipboard for the result
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const content = await pbpaste(udid);
    if (content !== SENTINEL) return content;
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

interface TestCase {
  name: string;
  source: string;
  expected: string;
}

const testCases: TestCase[] = JSON.parse(
  fs.readFileSync(path.join(DIR, "test-cases.json"), "utf-8"),
);

let udid: string;

describe("simulator", { timeout: 600_000 }, () => {
  beforeAll(async () => {
    if (!fs.existsSync(CLI_PATH)) throw new Error("Chute CLI not built. Run: pnpm build");
    mcli();
    fs.mkdirSync(TMP_DIR, { recursive: true });

    console.log("Setting up simulator...");
    udid = await ensureSimulator();
    console.log(`Simulator ready: ${udid}`);
  }, 300_000);

  afterAll(() => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  });

  test.each(testCases)(
    "$name",
    async ({ name, source, expected }) => {
      const shortcutName = `ChuteTest_${name.replace(/[^a-zA-Z0-9]/g, "")}`;
      const workDir = path.join(TMP_DIR, shortcutName);
      const build = await buildShortcut(source, shortcutName, workDir);
      const result = await runShortcutTest(build, shortcutName, udid);
      expect(result?.trim()).toBe(expected.trim());
    },
    60_000,
  );
});
