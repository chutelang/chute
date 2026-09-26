import { describe, test, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DIR = import.meta.dirname;
const REPO_ROOT = path.join(DIR, "..", "..");
const TMP_DIR = path.join(DIR, ".tmp");
const CLI_PATH = path.join(REPO_ROOT, "packages/cli/dist/cli.js");

const SENTINEL = "__CHUTE_TEST_WAITING__";
const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 15000;
const WDA_PORT = 8991;

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
        if (code !== 0) {
          reject(new Error(`${cmd} failed (${code}): ${stderr.trim()}`));
        } else {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        }
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
// WDA via HTTP (tap, pressHome — fast, no subprocess per call)
// ---------------------------------------------------------------------------

let wdaSession = "";

async function wdaRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const url = `http://localhost:${WDA_PORT}${path}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function createSession(): Promise<string> {
  const res = (await wdaRequest("POST", "/session", { capabilities: {} })) as any;
  return res.sessionId;
}

async function tap(x: number, y: number): Promise<void> {
  await wdaRequest("POST", `/session/${wdaSession}/wda/tap`, { x, y });
}

async function pressHome(): Promise<void> {
  await wdaRequest("POST", `/session/${wdaSession}/wda/homescreen`);
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
  if (matches.length === 0) {
    throw new Error("Test source must declare at least one variable");
  }
  const lastVar = matches[matches.length - 1][1];
  let modified = source;
  if (!modified.includes("import Device")) {
    modified = `import Device;\n${modified}`;
  }
  return `${modified}\nDevice.copyToClipboard(${lastVar});`;
}

// ---------------------------------------------------------------------------
// Build
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

async function findAndTapElement(label: string, timeoutMs = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = (await wdaRequest("POST", `/session/${wdaSession}/element`, {
        using: "name",
        value: label,
      })) as any;
      if (res.value?.ELEMENT) {
        await sleep(500);
        await wdaRequest("POST", `/session/${wdaSession}/element/${res.value.ELEMENT}/click`);
        return true;
      }
    } catch {
      /* element not found yet */
    }
    await sleep(500);
  }
  return false;
}

async function importShortcut(signedPath: string, udid: string): Promise<void> {
  await openurl(udid, `file://${signedPath}`);
  const found =
    (await findAndTapElement("Add Shortcut", 15000)) ||
    (await findAndTapElement("Update Shortcut", 2000));
  if (!found) {
    throw new Error("Timed out waiting for 'Add Shortcut' button");
  }
  await sleep(1000);
}

// ---------------------------------------------------------------------------
// WDA + Simulator lifecycle
// ---------------------------------------------------------------------------

let wdaProcess: ChildProcess | null = null;

let _wdaUdid: string;

function wdaXctestrun(): string {
  return path.join(
    process.env.HOME!,
    ".maestro-runner/cache/wda-builds/sim-ios26.5-iphone/DerivedData/Build/Products",
    "WebDriverAgentRunner_iphonesimulator26.5-arm64.xctestrun",
  );
}

async function buildWDAIfNeeded(udid: string): Promise<void> {
  if (fs.existsSync(wdaXctestrun())) {
    return;
  }
  const flowFile = path.join(TMP_DIR, "_wda-init.yaml");
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(flowFile, "appId: com.apple.Preferences\n---\n- pressKey: home\n");
  await exec(
    path.join(process.env.HOME!, ".maestro-runner/bin/maestro-runner"),
    ["--platform", "ios", "--device", udid, "test", flowFile],
    { timeout: 600000 },
  );
}

async function launchWDA(udid: string): Promise<void> {
  stopWDA();
  _wdaUdid = udid;

  const derivedData = path.join(
    process.env.HOME!,
    ".maestro-runner/cache/wda-builds/sim-ios26.5-iphone/DerivedData",
  );

  wdaProcess = spawn(
    "xcodebuild",
    [
      "test-without-building",
      "-xctestrun",
      wdaXctestrun(),
      "-destination",
      `platform=iOS Simulator,id=${udid}`,
      "-derivedDataPath",
      derivedData,
    ],
    { stdio: "ignore" },
  );

  wdaProcess.on("exit", () => {
    wdaProcess = null;
  });

  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetch(`http://localhost:${WDA_PORT}/status`);
      if (res.ok) {
        wdaSession = await createSession();
        return;
      }
    } catch {
      /* not ready yet */
    }
  }
  throw new Error("WDA did not start");
}

async function ensureWDA(): Promise<void> {
  try {
    const res = await fetch(`http://localhost:${WDA_PORT}/status`);
    if (res.ok) {
      return;
    }
  } catch {
    /* WDA is down */
  }
  console.log("  [WDA restarting...]");
  await launchWDA(_wdaUdid);
}

function stopWDA(): void {
  if (wdaProcess) {
    wdaProcess.kill("SIGTERM");
    wdaProcess = null;
  }
}

async function ensureSimulator(): Promise<string> {
  const { stdout } = await exec("xcrun", ["simctl", "list", "devices", "available", "-j"]);
  const allDevices = JSON.parse(stdout);
  const runtimeDevices: Array<{ udid: string; name: string; state: string }> =
    allDevices.devices?.[RUNTIME] ?? [];
  const candidate = runtimeDevices.find((d) => d.name.startsWith("iPhone 17 Pro"));
  if (!candidate) {
    throw new Error("No iPhone 17 Pro simulator found");
  }

  const udid = candidate.udid;

  if (candidate.state === "Booted") {
    await simctl("shutdown", udid);
  }
  await simctl("erase", udid);
  await simctl("boot", udid);
  await exec("xcrun", ["simctl", "bootstatus", udid, "-b"], { timeout: 120000 });

  return udid;
}

// ---------------------------------------------------------------------------
// Run one test case
// ---------------------------------------------------------------------------

async function runShortcutTest(
  build: BuildResult,
  shortcutName: string,
  udid: string,
): Promise<string | null> {
  await ensureWDA();
  await pressHome();
  await sleep(500);

  for (const sub of build.subShortcuts) {
    await importShortcut(sub, udid);
  }
  await importShortcut(build.main, udid);

  await pbcopy(udid, SENTINEL);
  await openurl(udid, `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`);

  // Dismiss permission dialogs
  for (let i = 0; i < 4; i++) {
    await sleep(1000);
    await tap(290, 175); // clipboard "Allow"
    await tap(201, 560); // output "Always Allow"
  }

  // Poll clipboard
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const content = await pbpaste(udid);
    if (content !== SENTINEL) {
      return content;
    }
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
    if (!fs.existsSync(CLI_PATH)) {
      throw new Error("Chute CLI not built. Run: pnpm build");
    }
    fs.mkdirSync(TMP_DIR, { recursive: true });

    console.log("Setting up simulator...");
    udid = await ensureSimulator();
    console.log(`Simulator ready: ${udid}`);

    console.log("Starting WebDriverAgent...");
    await buildWDAIfNeeded(udid);
    await launchWDA(udid);
    console.log("WDA ready");
  }, 300_000);

  afterAll(() => {
    stopWDA();
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
