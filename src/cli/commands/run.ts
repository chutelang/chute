import * as path from "node:path";
import { compile } from "../../compiler/pipeline.ts";
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
  const plistPath = path.join(outDir, `${baseName}.plist`);

  io.writeFile(plistPath, compileResult.main);

  for (const sub of compileResult.subShortcuts) {
    const subPath = path.join(outDir, `${sub.name}.shortcut`);
    io.writeFile(subPath, sub.plist);
  }

  if (!isSigningAvailable(io.spawn)) {
    io.removeFile(plistPath);
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
    signShortcut(io.spawn, plistPath, shortcutPath);
  } catch (err) {
    io.removeFile(plistPath);
    io.stderr(`chute run: signing failed: ${err instanceof Error ? err.message : err}\n`);
    io.setExitCode(1);
    return;
  }
  io.removeFile(plistPath);

  const result = io.spawn("open", [shortcutPath], {
    stdio: "inherit",
    timeout: 10000,
  });

  if (result.status !== 0) {
    io.stderr(`chute run: failed to open ${shortcutPath}\n`);
    io.setExitCode(1);
  }
}
