import * as path from "node:path";
import { compile } from "@chutelang/compiler";
import { type IO, realIO } from "../io.ts";
import { isSigningAvailable, signShortcut } from "../sign.ts";

export function run(file: string, io: IO = realIO): void {
  const resolved = path.resolve(file);

  if (!io.fileExists(resolved)) {
    io.stderr(`chute run: file not found: ${file}\n`);
    io.setExitCode(1);
    return;
  }

  const source = io.readFile(resolved);
  const compileResult = compile(source);

  const outDir = path.dirname(resolved);
  const baseName = path.basename(resolved, ".chute");

  if (!isSigningAvailable(io.spawn)) {
    io.stderr(
      "\n" +
        "  ⚠ WARNING: `shortcuts sign` is not available.\n" +
        "  Signing requires macOS with the Shortcuts CLI installed.\n" +
        "  Cannot run unsigned shortcuts.\n\n",
    );
    io.setExitCode(1);
    return;
  }

  const shortcutPath = path.join(outDir, `${baseName}.shortcut`);
  try {
    signShortcut(io, compileResult.main, shortcutPath);
  } catch (err) {
    io.stderr(`chute run: signing failed: ${err instanceof Error ? err.message : err}\n`);
    io.setExitCode(1);
    return;
  }

  for (const sub of compileResult.subShortcuts) {
    const subShortcutPath = path.join(outDir, `${sub.name}.shortcut`);
    try {
      signShortcut(io, sub.plist, subShortcutPath);
    } catch (err) {
      io.stderr(
        `chute run: signing failed for sub-shortcut ${sub.name}: ${err instanceof Error ? err.message : err}\n`,
      );
      io.setExitCode(1);
      return;
    }
  }

  const result = io.spawn("open", [shortcutPath], {
    stdio: "inherit",
    timeout: 10000,
  });

  if (result.status !== 0) {
    io.stderr(`chute run: failed to open ${shortcutPath}\n`);
    io.setExitCode(1);
  }
}
