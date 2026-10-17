export interface ShortcutArtifact {
  testName: string;
  shortcutName: string;
  fileName: string;
  expected: string;
  menuChoice?: string;
}

export interface ShortcutManifest {
  version: 1;
  artifacts: ShortcutArtifact[];
  vitestArgs: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function testNamePatternFromArgs(args: readonly string[]): string | undefined {
  let pattern: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    let candidate: string | undefined;
    if (argument === "-t" || argument === "--testNamePattern") {
      candidate = args[index + 1];
      if (candidate === undefined) {
        throw new Error(`${argument} requires a pattern`);
      }
      index += 1;
    } else if (argument.startsWith("--testNamePattern=")) {
      candidate = argument.slice("--testNamePattern=".length);
    }
    if (candidate !== undefined) {
      if (pattern !== undefined) {
        throw new Error("Specify only one test name pattern");
      }
      pattern = candidate;
    }
  }
  return pattern;
}

export function testNameMatchesPattern(testName: string, pattern: string): boolean {
  return new RegExp(pattern).test(`macOS Shortcuts > ${testName}`);
}

export function parseShortcutManifest(value: unknown): ShortcutManifest {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.artifacts)) {
    throw new Error("Invalid shortcut artifact manifest");
  }
  const artifacts: ShortcutArtifact[] = value.artifacts.map((artifact, index) => {
    if (
      !isRecord(artifact) ||
      typeof artifact.testName !== "string" ||
      typeof artifact.shortcutName !== "string" ||
      typeof artifact.fileName !== "string" ||
      typeof artifact.expected !== "string" ||
      (artifact.menuChoice !== undefined &&
        (typeof artifact.menuChoice !== "string" || artifact.menuChoice.length === 0))
    ) {
      throw new Error(`Invalid shortcut artifact at index ${index}`);
    }
    if (
      artifact.testName.length === 0 ||
      !/^ChuteTest_[A-Za-z0-9_]+$/.test(artifact.shortcutName) ||
      artifact.fileName === "." ||
      artifact.fileName === ".." ||
      artifact.fileName.includes("/") ||
      artifact.fileName.includes("\\") ||
      !artifact.fileName.endsWith(".shortcut")
    ) {
      throw new Error(`Unsafe shortcut artifact filename: ${artifact.fileName}`);
    }
    if (artifact.fileName !== `${artifact.shortcutName}.shortcut`) {
      throw new Error(`Shortcut artifact filename does not match its workflow name`);
    }
    return {
      testName: artifact.testName,
      shortcutName: artifact.shortcutName,
      fileName: artifact.fileName,
      expected: artifact.expected,
      ...(artifact.menuChoice === undefined ? {} : { menuChoice: artifact.menuChoice }),
    };
  });
  if (artifacts.length === 0) {
    throw new Error("Shortcut artifact manifest is empty");
  }
  for (const field of ["testName", "shortcutName", "fileName"] as const) {
    const values = artifacts.map((artifact) => artifact[field]);
    if (new Set(values).size !== values.length) {
      throw new Error(`Duplicate shortcut artifact ${field}`);
    }
  }
  const vitestArgs = value.vitestArgs;
  if (!Array.isArray(vitestArgs) || vitestArgs.some((argument) => typeof argument !== "string")) {
    throw new Error("Invalid shortcut artifact Vitest arguments");
  }
  return { version: 1, artifacts, vitestArgs };
}

export function makeShortcutName(testName: string, suffix: string): string {
  const safeName = testName.replace(/[^a-zA-Z0-9]/g, "");
  const safeSuffix = suffix.replace(/[^a-zA-Z0-9]/g, "");
  if (!safeName || !safeSuffix) {
    throw new Error("Shortcut name components must contain letters or numbers");
  }
  return `ChuteTest_${safeName}_${safeSuffix}`;
}

export function withWorkflowNameAndOutput(source: string, shortcutName: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(shortcutName)) {
    throw new Error(`Invalid shortcut name: ${shortcutName}`);
  }
  const declaration = /(\bshortcut\s*\{[\s\S]*?\bname\s*:\s*)"[^"]*"/;
  if (!declaration.test(source)) {
    throw new Error("Test source must declare a shortcut name");
  }
  const variables = [...source.matchAll(/\b(?:const|let)\s+([a-zA-Z_]\w*)/g)];
  const resultName = variables.at(-1)?.[1];
  if (!resultName) {
    throw new Error("Test source must declare at least one variable");
  }
  const renamed = source.replace(declaration, `$1"${shortcutName}"`);
  const withImport = /^\s*import Scripting\b/m.test(renamed)
    ? renamed
    : `import Scripting;\n${renamed}`;
  return `${withImport}\nScripting.stopAndOutput("\${${resultName}}");`;
}

export function shortcutListContains(output: string, shortcutName: string): boolean {
  return output.split(/\r?\n/).some((line) => line.trim() === shortcutName);
}

export function runShortcutAppleScript(shortcutName: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(shortcutName)) {
    throw new Error(`Invalid shortcut name: ${shortcutName}`);
  }
  return `tell application id "com.apple.shortcuts" to run shortcut "${shortcutName}"`;
}

export function shortcutsAutomationPreflightAppleScript(): string {
  return 'tell application id "com.apple.shortcuts" to count shortcuts';
}

export function selectMenuOptionAppleScript(shortcutName: string, choice: string): string {
  if (!/^ChuteTest_[A-Za-z0-9_]+$/.test(shortcutName) || !choice || /[\r\n\0]/.test(choice)) {
    throw new Error("Invalid menu choice");
  }
  const literal = '"' + choice.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  return `
tell application "System Events"
  repeat 100 times
    if exists process "ShortcutsViewService" then
      tell process "ShortcutsViewService"
        repeat with candidateWindow in every window
          if name of candidateWindow is "${shortcutName}" then
            set windowContents to entire contents of candidateWindow
            repeat with candidate in windowContents
              if role of candidate is "AXRow" then
                set rowContents to entire contents of candidate
                repeat with rowContent in rowContents
                  if role of rowContent is "AXStaticText" and value of rowContent is ${literal} then
                    set selected of candidate to true
                    set frontmost to true
                    key code 36
                    return
                  end if
                end repeat
              end if
            end repeat
          end if
        end repeat
      end tell
    end if
    delay 0.25
  end repeat
  error "Timed out waiting for Shortcuts menu option " & ${literal}
end tell`;
}

export function grantShortcutsAutomationAppleScript(
  pollAttempts = 80,
  pollDelaySeconds = 0.25,
): string {
  if (!Number.isInteger(pollAttempts) || pollAttempts < 1) {
    throw new Error("Automation polling attempts must be a positive integer");
  }
  if (!Number.isFinite(pollDelaySeconds) || pollDelaySeconds <= 0) {
    throw new Error("Automation polling delay must be positive");
  }
  return `
tell application "System Events"
  repeat ${pollAttempts} times
    if exists process "UserNotificationCenter" then
      tell process "UserNotificationCenter"
        repeat with candidateWindow in every window
          try
            if subrole of candidateWindow is "AXSystemDialog" then
              set promptText to value of every static text of candidateWindow as text
              if promptText contains "Shortcuts" then
                set defaultControl to value of attribute "AXDefaultButton" of candidateWindow
                perform action "AXPress" of defaultControl
                return
              end if
            end if
          end try
        end repeat
      end tell
    end if
    delay ${pollDelaySeconds}
  end repeat
  error "Timed out waiting for the Shortcuts Automation consent dialog"
end tell`;
}

export function normalizeAppleScriptOutput(output: string): string {
  const trimmed = output.trim();
  return /^-?(?:0|[1-9]\d*)\.0$/.test(trimmed) ? trimmed.slice(0, -2) : trimmed;
}

export function importAppleScript(pollAttempts = 80, pollDelaySeconds = 0.25): string {
  if (!Number.isInteger(pollAttempts) || pollAttempts < 1) {
    throw new Error("Import polling attempts must be a positive integer");
  }
  if (!Number.isFinite(pollDelaySeconds) || pollDelaySeconds <= 0) {
    throw new Error("Import polling delay must be positive");
  }
  return `
tell application "Shortcuts" to activate
tell application "System Events"
  tell process "Shortcuts"
    set frontmost to true
    repeat ${pollAttempts} times
      repeat with candidateWindow in (every window)
        try
          set windowName to name of candidateWindow
          if windowName is missing value or windowName is "" then
            set previewContent to scroll area 1 of group 1 of candidateWindow
            if (count of buttons of previewContent) is greater than or equal to 2 and (count of static texts of previewContent) is greater than or equal to 1 then
              key code 36
              repeat ${pollAttempts} times
                set importWindowOpen to false
                repeat with remainingWindow in (every window)
                  try
                    set remainingWindowName to name of remainingWindow
                    if remainingWindowName is missing value or remainingWindowName is "" then
                      set importWindowOpen to true
                      exit repeat
                    end if
                  end try
                end repeat
                if not importWindowOpen then return
                delay ${pollDelaySeconds}
              end repeat
              error "The Shortcuts import preview did not close after invoking its default action"
            end if
          end if
        end try
      end repeat
      delay ${pollDelaySeconds}
    end repeat

    set diagnostics to {}
    repeat with candidateWindow in (every window)
      try
        set windowName to name of candidateWindow
        if windowName is missing value then set windowName to "<untitled>"
        set end of diagnostics to "window: " & windowName
        set end of diagnostics to "contents: " & (entire contents of candidateWindow)
      end try
    end repeat
    set AppleScript's text item delimiters to " | "
    error "Timed out waiting for the Shortcuts import preview. Windows and controls: " & diagnostics as text
  end tell
end tell`;
}

export function consoleGuiCommand(
  uid: number,
  command: string,
  args: readonly string[] = [],
): string[] {
  if (!Number.isSafeInteger(uid) || uid < 1) {
    throw new Error(`Invalid console user UID: ${uid}`);
  }
  if (!command) {
    throw new Error("Console GUI command is required");
  }
  return ["-n", "launchctl", "asuser", String(uid), command, ...args];
}

export function guiDiagnosticsAppleScript(): string {
  return `
on safeText(theValue)
  try
    if theValue is missing value then return "<missing>"
    return theValue as text
  on error
    return "<unavailable>"
  end try
end safeText

tell application "System Events"
  set diagnostics to {}
  repeat with guiProcess in every application process
    set processBackground to background only of guiProcess
    set processWindowCount to count of windows of guiProcess
    if processBackground is false or processWindowCount is greater than 0 then
    set processName to my safeText(name of guiProcess)
    set processBundle to my safeText(bundle identifier of guiProcess)
    set processID to my safeText(unix id of guiProcess)
    set processFrontmost to my safeText(frontmost of guiProcess)
    set end of diagnostics to "process: " & processName & " pid=" & processID & " bundle=" & processBundle & " frontmost=" & processFrontmost & " background=" & processBackground
    repeat with candidateWindow in (every window of guiProcess)
      set windowName to my safeText(name of candidateWindow)
      set windowRole to my safeText(role of candidateWindow)
      set windowSubrole to my safeText(subrole of candidateWindow)
      set windowMinimized to my safeText(value of attribute "AXMinimized" of candidateWindow)
      set end of diagnostics to "  window: " & windowName & " role=" & windowRole & " subrole=" & windowSubrole & " minimized=" & windowMinimized
      try
        set end of diagnostics to "    controls: " & (entire contents of candidateWindow)
      end try
    end repeat
    end if
  end repeat
  set AppleScript's text item delimiters to linefeed
  return diagnostics as text
end tell`;
}

export function truncateDiagnosticOutput(output: string, maxCharacters = 20_000): string {
  if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 1) {
    throw new Error("Diagnostic output limit must be a positive integer");
  }
  if (output.length <= maxCharacters) {
    return output;
  }
  return `[... ${output.length - maxCharacters} earlier characters omitted ...]\n${output.slice(-maxCharacters)}`;
}

export async function mapConcurrently<T, R>(
  items: readonly T[],
  concurrency: number,
  operation: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1) {
    throw new Error("Concurrency must be a positive integer");
  }
  const results: R[] = [];
  results.length = items.length;
  let nextIndex = 0;
  let failed = false;
  let failure: unknown;
  async function worker(): Promise<void> {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await operation(items[index]!, index);
      } catch (error: unknown) {
        if (!failed) {
          failed = true;
          failure = error;
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  if (failed) {
    throw failure;
  }
  return results;
}

interface ShortcutSigningRetryOptions {
  sleep?: (delayMs: number) => Promise<void>;
  onRetry?: (error: unknown, nextAttempt: number, delayMs: number) => void;
}

export async function retryShortcutSigning<T>(
  operation: (attempt: number) => Promise<T>,
  options: ShortcutSigningRetryOptions = {},
): Promise<T> {
  const sleep =
    options.sleep ?? ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)));
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error: unknown) {
      if (attempt === 3 || !commandFailureMessage(error).includes("NSURLErrorDomain")) {
        throw error;
      }
      const delayMs = 1_000 * 2 ** (attempt - 1);
      options.onRetry?.(error, attempt + 1, delayMs);
      await sleep(delayMs);
    }
  }
  throw new Error("Unreachable shortcut signing retry state");
}

export function commandFailureMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const stderr = "stderr" in error ? error.stderr : undefined;
  const stderrText =
    typeof stderr === "string"
      ? stderr.trim()
      : Buffer.isBuffer(stderr)
        ? stderr.toString("utf8").trim()
        : "";
  return stderrText && !error.message.includes(stderrText)
    ? `${error.message}\n${stderrText}`
    : error.message;
}
