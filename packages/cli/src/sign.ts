import * as path from "node:path";
import type { IO, Spawn } from "./io.ts";

export function isSigningAvailable(spawn: Spawn): boolean {
  try {
    const result = spawn("shortcuts", ["sign", "--help"], {
      stdio: "pipe",
      timeout: 5000,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

export function signShortcut(io: IO, plist: string, outputPath: string): void {
  const stagedPath = path.join(
    path.dirname(outputPath),
    `${path.basename(outputPath, ".shortcut")}.unsigned.shortcut`,
  );

  io.writeFile(stagedPath, plist);

  try {
    const result = io.spawn(
      "shortcuts",
      ["sign", "--mode", "anyone", "--input", stagedPath, "--output", outputPath],
      {
        stdio: "pipe",
        timeout: 30000,
      },
    );

    if (result.status !== 0) {
      const stderr = result.stderr?.toString().trim() ?? "";
      throw new Error(`shortcuts sign failed (exit ${result.status}): ${stderr}`);
    }
  } finally {
    io.removeFile(stagedPath);
  }
}
