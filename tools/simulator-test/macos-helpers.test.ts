import { describe, expect, it } from "vitest";
import { compile } from "../../packages/compiler/src/index.js";
import {
  commandFailureMessage,
  consoleGuiCommand,
  grantShortcutsAutomationAppleScript,
  guiDiagnosticsAppleScript,
  importAppleScript,
  mapConcurrently,
  makeShortcutName,
  normalizeAppleScriptOutput,
  parseShortcutManifest,
  retryShortcutSigning,
  runShortcutAppleScript,
  selectMenuOptionAppleScript,
  shortcutListContains,
  shortcutsAutomationPreflightAppleScript,
  testNameMatchesPattern,
  testNamePatternFromArgs,
  truncateDiagnosticOutput,
  withWorkflowNameAndOutput,
} from "./macos-helpers.js";

describe("macOS shortcut helpers", () => {
  it("maps work concurrently within a bound while preserving input order", async () => {
    let active = 0;
    let maximumActive = 0;
    let started = 0;
    let releaseFirstWave!: () => void;
    let markFirstWaveStarted!: () => void;
    const firstWave = new Promise<void>((resolve) => {
      releaseFirstWave = resolve;
    });
    const firstWaveStarted = new Promise<void>((resolve) => {
      markFirstWaveStarted = resolve;
    });

    const mapped = mapConcurrently([3, 1, 2], 2, async (value, index) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      started += 1;
      if (started === 2) {
        markFirstWaveStarted();
      }
      if (index < 2) {
        await firstWave;
      }
      active -= 1;
      return value * 10;
    });

    await firstWaveStarted;
    expect(started).toBe(2);
    releaseFirstWave();
    await expect(mapped).resolves.toEqual([30, 10, 20]);
    expect(maximumActive).toBe(2);
  });

  it("waits for in-flight concurrent work before rejecting", async () => {
    const error = new Error("failed");
    let started = 0;
    let settled = false;
    let finishSecond!: () => void;
    let markBothStarted!: () => void;
    const secondCanFinish = new Promise<void>((resolve) => {
      finishSecond = resolve;
    });
    const bothStarted = new Promise<void>((resolve) => {
      markBothStarted = resolve;
    });

    const mapped = mapConcurrently([0, 1], 2, async (value) => {
      started += 1;
      if (started === 2) {
        markBothStarted();
      }
      await bothStarted;
      if (value === 0) {
        throw error;
      }
      await secondCanFinish;
      return value;
    });
    void mapped
      .finally(() => {
        settled = true;
      })
      .catch(() => undefined);

    await bothStarted;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(settled).toBe(false);
    finishSecond();
    await expect(mapped).rejects.toBe(error);
  });

  it("retries transient Shortcuts signing failures and preserves backoff", async () => {
    const attempts: number[] = [];
    const delays: number[] = [];
    const result = await retryShortcutSigning(
      async (attempt) => {
        attempts.push(attempt);
        if (attempt < 3) {
          throw Object.assign(new Error("signing failed"), {
            stderr: "Error: The operation couldn’t be completed. (NSURLErrorDomain error 500.)",
          });
        }
        return "signed";
      },
      {
        sleep: async (delayMs) => {
          delays.push(delayMs);
        },
      },
    );

    expect(result).toBe("signed");
    expect(attempts).toEqual([1, 2, 3]);
    expect(delays).toEqual([1_000, 2_000]);
  });

  it("does not retry non-network Shortcuts signing failures", async () => {
    const error = Object.assign(new Error("signing failed"), {
      stderr: "Error: The shortcut is invalid.",
    });
    let attempts = 0;

    await expect(
      retryShortcutSigning(async () => {
        attempts += 1;
        throw error;
      }),
    ).rejects.toBe(error);
    expect(attempts).toBe(1);
  });

  it("validates signed artifact manifests", () => {
    const manifest = parseShortcutManifest({
      version: 1,
      vitestArgs: ["-t", "addition"],
      artifacts: [
        {
          testName: "addition",
          shortcutName: "ChuteTest_addition_1",
          fileName: "ChuteTest_addition_1.shortcut",
          expected: "3",
        },
      ],
    });
    expect(manifest.artifacts[0]?.expected).toBe("3");
    expect(manifest.vitestArgs).toEqual(["-t", "addition"]);
    expect(() =>
      parseShortcutManifest({
        version: 1,
        vitestArgs: [],
        artifacts: [
          {
            testName: "addition",
            shortcutName: "ChuteTest_addition_1",
            fileName: "../outside.shortcut",
            expected: "3",
          },
        ],
      }),
    ).toThrow("Unsafe shortcut artifact filename");
  });

  it("creates safe unique names", () => {
    expect(makeShortcutName("arithmetic-add", "123_abc")).toBe("ChuteTest_arithmeticadd_123abc");
    expect(() => makeShortcutName("---", "123")).toThrow();
  });

  it("preserves and validates explicit menu choices in manifests", () => {
    const artifact = {
      testName: "menu-basic",
      shortcutName: "ChuteTest_menu_1",
      fileName: "ChuteTest_menu_1.shortcut",
      expected: "picked-A",
      menuChoice: "A",
    };
    const manifest = { version: 1, vitestArgs: [], artifacts: [artifact] };
    expect(parseShortcutManifest(manifest).artifacts[0]?.menuChoice).toBe("A");
    for (const menuChoice of ["", 1, null, []]) {
      expect(() =>
        parseShortcutManifest({ ...manifest, artifacts: [{ ...artifact, menuChoice }] }),
      ).toThrow();
    }
    expect(() => selectMenuOptionAppleScript("unsafe", "A")).toThrow();
    expect(() => selectMenuOptionAppleScript("ChuteTest_menu_1", "A\nB")).toThrow();
    expect(selectMenuOptionAppleScript("ChuteTest_menu_1", 'A"\\B')).toContain('"A\\"\\\\B"');
  });

  it("renames workflow metadata and appends textual output", () => {
    const source = 'shortcut { name: "Test" } const answer = 42;';
    const wrapped = withWorkflowNameAndOutput(source, "ChuteTest_answer_1");
    expect(wrapped).toContain('name: "ChuteTest_answer_1"');
    expect(wrapped).toMatch(/^import Scripting;/);
    expect(wrapped).toContain('Scripting.stopAndOutput("${answer}");');
    const plist = compile(wrapped).main;
    expect(plist).toContain("<string>ChuteTest_answer_1</string>");
    expect(plist).toContain("<string>is.workflow.actions.output</string>");
  });

  it("does not duplicate an existing Scripting import", () => {
    const wrapped = withWorkflowNameAndOutput(
      'import Scripting;\nshortcut { name: "Test" } const value = "ok";',
      "ChuteTest_value_1",
    );
    expect(wrapped.match(/import Scripting/g)).toHaveLength(1);
  });

  it("waits for the import preview and invokes its default action", () => {
    const script = importAppleScript();
    expect(script).toContain("repeat 80 times");
    expect(script).toContain("delay 0.25");
    expect(script).toContain("repeat with candidateWindow in (every window)");
    expect(script).toContain('windowName is missing value or windowName is ""');
    expect(script).toContain("count of buttons of previewContent");
    expect(script).toContain("count of static texts of previewContent");
    expect(script).toContain("key code 36");
    expect(script).toContain("if not importWindowOpen then return");
    expect(script).toContain("import preview did not close");
    expect(script).not.toContain("visible of candidateWindow");
    expect(script).not.toContain("repeat with candidate in (entire contents");
    expect(script).toContain("Windows and controls");
    expect(() => importAppleScript(0)).toThrow("positive integer");
  });

  it("builds commands for the dynamically discovered GUI domain", () => {
    expect(consoleGuiCommand(501, "/usr/bin/open", ["file.shortcut"])).toEqual([
      "-n",
      "launchctl",
      "asuser",
      "501",
      "/usr/bin/open",
      "file.shortcut",
    ]);
    expect(() => consoleGuiCommand(0, "open")).toThrow("Invalid console user UID");
    expect(() => consoleGuiCommand(501, "")).toThrow("required");
  });

  it("builds a safe Shortcuts scripting command", () => {
    expect(runShortcutAppleScript("ChuteTest_answer_1")).toBe(
      'tell application id "com.apple.shortcuts" to run shortcut "ChuteTest_answer_1"',
    );
    expect(() => runShortcutAppleScript('unsafe" name')).toThrow("Invalid shortcut name");
    expect(shortcutsAutomationPreflightAppleScript()).toContain("to count shortcuts");
  });

  it("grants Shortcuts Automation through the system dialog default action", () => {
    const script = grantShortcutsAutomationAppleScript();
    expect(script).toContain('tell process "UserNotificationCenter"');
    expect(script).toContain('subrole of candidateWindow is "AXSystemDialog"');
    expect(script).toContain('promptText contains "Shortcuts"');
    expect(script).toContain('attribute "AXDefaultButton"');
    expect(script).toContain('perform action "AXPress"');
    expect(script).not.toContain('button "Allow"');
    expect(() => grantShortcutsAutomationAppleScript(0)).toThrow("positive integer");
  });

  it("normalizes integral AppleScript numbers without changing other output", () => {
    expect(normalizeAppleScriptOutput("42.0\n")).toBe("42");
    expect(normalizeAppleScriptOutput("-7.0")).toBe("-7");
    expect(normalizeAppleScriptOutput("3.5")).toBe("3.5");
    expect(normalizeAppleScriptOutput("hello world\n")).toBe("hello world");
  });

  it("enumerates foreground GUI processes, bundle IDs, windows, roles, and controls", () => {
    const script = guiDiagnosticsAppleScript();
    expect(script).toContain("processBackground is false or processWindowCount is greater than 0");
    expect(script).toContain("bundle identifier of guiProcess");
    expect(script).toContain("unix id of guiProcess");
    expect(script).toContain("every window of guiProcess");
    expect(script).toContain("entire contents of candidateWindow");
  });

  it("bounds diagnostic output while retaining the newest evidence", () => {
    expect(truncateDiagnosticOutput("abcdef", 4)).toBe(
      "[... 2 earlier characters omitted ...]\ncdef",
    );
    expect(truncateDiagnosticOutput("abc", 4)).toBe("abc");
    expect(() => truncateDiagnosticOutput("abc", 0)).toThrow("positive integer");
  });

  it("preserves command stderr in failures", () => {
    const error = Object.assign(new Error("command failed"), {
      stderr: "Visible windows and controls: Add Shortcut",
    });
    expect(commandFailureMessage(error)).toBe(
      "command failed\nVisible windows and controls: Add Shortcut",
    );
  });

  it("reads Vitest test-name filters", () => {
    expect(testNamePatternFromArgs(["-t", "arithmetic-add"])).toBe("arithmetic-add");
    expect(testNamePatternFromArgs(["--testNamePattern=arithmetic.*"])).toBe("arithmetic.*");
    expect(testNamePatternFromArgs(["--reporter", "verbose"])).toBeUndefined();
    expect(() => testNamePatternFromArgs(["-t"])).toThrow("requires a pattern");
    expect(() => testNamePatternFromArgs(["-t", "one", "-t", "two"])).toThrow(
      "only one test name pattern",
    );
  });

  it("matches filters against the suite and test name", () => {
    expect(testNameMatchesPattern("arithmetic-add", "arithmetic-add")).toBe(true);
    expect(testNameMatchesPattern("arithmetic-add", "^macOS Shortcuts > arithmetic-add$")).toBe(
      true,
    );
    expect(testNameMatchesPattern("text-literal", "^arithmetic")).toBe(false);
    expect(() => testNameMatchesPattern("arithmetic-add", "[")).toThrow();
  });

  it("matches shortcut list entries exactly", () => {
    expect(shortcutListContains("One\nChuteTest_x_1\nTwo", "ChuteTest_x_1")).toBe(true);
    expect(shortcutListContains("ChuteTest_x_10", "ChuteTest_x_1")).toBe(false);
  });
});
