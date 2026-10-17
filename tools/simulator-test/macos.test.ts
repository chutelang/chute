import { afterAll, describe, expect, test } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  commandFailureMessage,
  consoleGuiCommand,
  grantShortcutsAutomationAppleScript,
  guiDiagnosticsAppleScript,
  importAppleScript,
  normalizeAppleScriptOutput,
  parseShortcutManifest,
  runShortcutAppleScript,
  selectMenuOptionAppleScript,
  shortcutListContains,
  shortcutsAutomationPreflightAppleScript,
  truncateDiagnosticOutput,
} from "./macos-helpers.js";

const execFileAsync = promisify(execFile);
const ARTIFACT_DIRECTORY = process.env.CHUTE_SHORTCUT_ARTIFACTS;
const IMPORT_UI_PROCESS_TIMEOUT_MS = 45_000;
const IMPORT_UI_POLL_ATTEMPTS = 80;
const IMPORT_UI_POLL_DELAY_SECONDS = 0.25;
const IMPORT_VERIFICATION_TIMEOUT_MS = 30_000;
const LOCAL_ARTIFACT_DIRECTORY = fs.mkdtempSync(
  path.join(process.env.TMPDIR ?? "/tmp", "chute-shortcuts-import."),
);

interface ConsoleSession {
  user: string;
  uid: number;
}

async function exec(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number } = {},
): Promise<{ stdout: string; stderr: string }> {
  try {
    const execution = execFileAsync(command, args, {
      cwd: options.cwd,
      timeout: options.timeout ?? 30_000,
      maxBuffer: 8 * 1024 * 1024,
    });
    execution.child.stdin?.end();
    const { stdout, stderr } = await execution;
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error: unknown) {
    throw new Error(commandFailureMessage(error), { cause: error });
  }
}

async function diagnosticExec(
  command: string,
  args: string[],
  options: { timeout?: number } = {},
): Promise<string> {
  try {
    const execution = execFileAsync(command, args, {
      timeout: options.timeout ?? 15_000,
      maxBuffer: 8 * 1024 * 1024,
    });
    execution.child.stdin?.end();
    const { stdout, stderr } = await execution;
    return [stdout.trim(), stderr.trim()].filter(Boolean).join("\n") || "<no output>";
  } catch (error: unknown) {
    return `<command failed: ${commandFailureMessage(error)}>`;
  }
}

async function consoleSession(): Promise<ConsoleSession> {
  const { stdout: user } = await exec("/usr/bin/stat", ["-f", "%Su", "/dev/console"]);
  if (!user || user === "root" || user === "loginwindow") {
    throw new Error(`No logged-in Aqua console user owns /dev/console (found: ${user || "none"})`);
  }
  const { stdout: uidText } = await exec("/usr/bin/id", ["-u", user]);
  const uid = Number(uidText);
  if (!Number.isSafeInteger(uid) || uid < 1) {
    throw new Error(`Invalid UID for console user ${user}: ${uidText}`);
  }
  try {
    await exec("/bin/launchctl", ["print", `gui/${uid}`]);
  } catch (error: unknown) {
    throw new Error(`Console user ${user} (${uid}) has no active launchd gui/${uid} domain`, {
      cause: error,
    });
  }
  return { user, uid };
}

async function execInConsoleGui(
  session: ConsoleSession,
  command: string,
  args: string[],
  timeout = 30_000,
): Promise<{ stdout: string; stderr: string }> {
  return exec("/usr/bin/sudo", consoleGuiCommand(session.uid, command, args), { timeout });
}

async function importDiagnostics(
  localShortcutPath: string,
  session: ConsoleSession | undefined,
): Promise<string> {
  const sections: string[] = [];
  const consoleUser = await diagnosticExec("/usr/bin/stat", ["-f", "%Su", "/dev/console"]);
  const consoleUid = consoleUser.startsWith("<")
    ? "unknown"
    : await diagnosticExec("/usr/bin/id", ["-u", consoleUser]);
  const guiDomain = /^\d+$/.test(consoleUid)
    ? await diagnosticExec("/bin/launchctl", ["print", `gui/${consoleUid}`])
    : "<not checked: console UID unavailable>";
  sections.push(
    `Console session:\nuser=${consoleUser}\nuid=${consoleUid}\ngui/${consoleUid}=${guiDomain.startsWith("<command failed:") ? "inactive" : "active"}`,
  );

  sections.push(
    `Shortcuts processes:\n${await diagnosticExec("/bin/ps", [
      "-axo",
      "user=,uid=,pid=,ppid=,stat=,command=",
    ]).then(
      (output) =>
        output
          .split(/\r?\n/)
          .filter((line) =>
            /Shortcuts|Finder|System Events|CoreServicesUIAgent|UserNotificationCenter/.test(line),
          )
          .join("\n") || "<none>",
    )}`,
  );

  if (session) {
    const guiOutput = await diagnosticExec(
      "/usr/bin/sudo",
      consoleGuiCommand(session.uid, "/usr/bin/osascript", ["-e", guiDiagnosticsAppleScript()]),
      { timeout: 30_000 },
    );
    sections.push(`Foreground GUI processes and windows:\n${guiOutput}`);
  } else {
    sections.push("Foreground GUI processes and windows:\n<not checked: GUI session unavailable>");
  }

  const fileCommands: Array<[string, string[]]> = [
    ["/usr/bin/file", [localShortcutPath]],
    ["/bin/ls", ["-leO@", localShortcutPath]],
    [
      "/usr/bin/stat",
      ["-f", "owner=%Su group=%Sg mode=%Sp size=%z bytes modified=%Sm", localShortcutPath],
    ],
    ["/usr/bin/xattr", ["-lr", localShortcutPath]],
    ["/usr/bin/mdls", ["-name", "kMDItemContentType", "-name", "kMDItemKind", localShortcutPath]],
  ];
  const fileDetails: string[] = [];
  for (const [command, args] of fileCommands) {
    fileDetails.push(`$ ${command} ${args.join(" ")}\n${await diagnosticExec(command, args)}`);
  }
  sections.push(`Import file details:\n${fileDetails.join("\n")}`);

  const logPredicate =
    '((process == "Shortcuts" OR process == "ShortcutsViewService" OR process == "CoreServicesUIAgent" OR process == "lsd") AND (messageType >= 16 OR eventMessage CONTAINS[c] "shortcut" OR eventMessage CONTAINS[c] "workflow" OR eventMessage CONTAINS[c] "document" OR eventMessage CONTAINS[c] "launch")) OR ((process == "runningboardd" OR process == "sandboxd" OR process == "trustd" OR process == "syspolicyd") AND messageType >= 16)';
  const logs = await diagnosticExec(
    "/usr/bin/log",
    ["show", "--style", "compact", "--last", "3m", "--info", "--predicate", logPredicate],
    { timeout: 30_000 },
  );
  sections.push(`Relevant unified logs (bounded):\n${truncateDiagnosticOutput(logs)}`);

  return sections.join("\n\n");
}

async function importShortcut(shortcutPath: string, shortcutName: string): Promise<ConsoleSession> {
  const localShortcutPath = path.join(LOCAL_ARTIFACT_DIRECTORY, path.basename(shortcutPath));
  fs.copyFileSync(shortcutPath, localShortcutPath);
  fs.chmodSync(localShortcutPath, 0o600);

  let session: ConsoleSession | undefined;
  try {
    session = await consoleSession();

    // SSH commands do not necessarily inherit the logged-in Aqua bootstrap
    // namespace. Launch the guest-local document in its console user's GUI domain.
    await execInConsoleGui(session, "/usr/bin/open", [
      "-b",
      "com.apple.shortcuts",
      localShortcutPath,
    ]);
    if (await waitForShortcut(shortcutName, 2_000)) {
      return session;
    }
    await execInConsoleGui(
      session,
      "/usr/bin/osascript",
      ["-e", importAppleScript(IMPORT_UI_POLL_ATTEMPTS, IMPORT_UI_POLL_DELAY_SECONDS)],
      IMPORT_UI_PROCESS_TIMEOUT_MS,
    );

    if (await waitForShortcut(shortcutName, IMPORT_VERIFICATION_TIMEOUT_MS)) {
      return session;
    }
    throw new Error(`Imported shortcut did not appear in Shortcuts: ${shortcutName}`);
  } catch (error: unknown) {
    const diagnostics = await importDiagnostics(localShortcutPath, session);
    throw new Error(`${commandFailureMessage(error)}\n\nImport diagnostics:\n${diagnostics}`, {
      cause: error,
    });
  }
}

async function waitForShortcut(shortcutName: string, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { stdout } = await exec("shortcuts", ["list"]);
    if (shortcutListContains(stdout, shortcutName)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

async function closeShortcuts(session: ConsoleSession): Promise<void> {
  await execInConsoleGui(session, "/usr/bin/osascript", [
    "-e",
    'tell application id "com.apple.shortcuts" to quit',
  ]);
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      await exec("/usr/bin/pgrep", ["-x", "Shortcuts"], { timeout: 5_000 });
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for Shortcuts to quit after import");
}

async function ensureShortcutsAutomation(session: ConsoleSession): Promise<void> {
  const preflight = execInConsoleGui(
    session,
    "/usr/bin/osascript",
    ["-e", shortcutsAutomationPreflightAppleScript()],
    30_000,
  );
  const state = await Promise.race([
    preflight.then(
      () => "settled" as const,
      () => "settled" as const,
    ),
    new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), 1_000)),
  ]);
  if (state === "pending") {
    await execInConsoleGui(
      session,
      "/usr/bin/osascript",
      ["-e", grantShortcutsAutomationAppleScript()],
      30_000,
    );
  }
  await preflight;
}

async function runShortcut(
  shortcutName: string,
  session: ConsoleSession,
  localShortcutPath: string,
  menuChoice?: string,
): Promise<string> {
  try {
    await ensureShortcutsAutomation(session);
    const execution = execInConsoleGui(
      session,
      "/usr/bin/osascript",
      ["-e", runShortcutAppleScript(shortcutName)],
      60_000,
    );
    const selection =
      menuChoice === undefined
        ? Promise.resolve()
        : execInConsoleGui(
            session,
            "/usr/bin/sudo",
            [
              "-n",
              "-u",
              session.user,
              "/usr/bin/osascript",
              "-e",
              selectMenuOptionAppleScript(shortcutName, menuChoice),
            ],
            30_000,
          );
    const outcomes = await Promise.allSettled([execution, selection]);
    if (outcomes[1].status === "rejected") {
      throw outcomes[1].reason;
    }
    if (outcomes[0].status === "rejected") {
      throw outcomes[0].reason;
    }
    const { stdout } = outcomes[0].value;
    return normalizeAppleScriptOutput(stdout);
  } catch (error: unknown) {
    const diagnostics = await importDiagnostics(localShortcutPath, session);
    throw new Error(`${commandFailureMessage(error)}\n\nRun diagnostics:\n${diagnostics}`, {
      cause: error,
    });
  }
}

if (process.platform !== "darwin" || process.arch !== "arm64") {
  throw new Error("macOS shortcut tests must run in an Apple Silicon Tart guest");
}
if (!ARTIFACT_DIRECTORY) {
  throw new Error("CHUTE_SHORTCUT_ARTIFACTS is required");
}
const manifest = parseShortcutManifest(
  JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIRECTORY, "manifest.json"), "utf8")),
);

afterAll(() => {
  fs.rmSync(LOCAL_ARTIFACT_DIRECTORY, { recursive: true, force: true });
});

describe("macOS Shortcuts", { timeout: 240_000 }, () => {
  test.each(manifest.artifacts)(
    "$testName",
    async ({ fileName, shortcutName, expected, menuChoice }) => {
      const shortcutPath = path.join(ARTIFACT_DIRECTORY, fileName);
      if (!fs.statSync(shortcutPath).isFile()) {
        throw new Error(`Shortcut artifact is not a file: ${fileName}`);
      }
      const session = await importShortcut(shortcutPath, shortcutName);
      const localShortcutPath = path.join(LOCAL_ARTIFACT_DIRECTORY, path.basename(shortcutPath));
      try {
        const result = await runShortcut(shortcutName, session, localShortcutPath, menuChoice);
        expect(result).toBe(expected.trim());
      } finally {
        await closeShortcuts(session);
      }
    },
  );
});
