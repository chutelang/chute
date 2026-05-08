import type { Spawn } from "./io.ts";

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

export function signShortcut(spawn: Spawn, plistPath: string, outputPath: string): void {
  const result = spawn(
    "shortcuts",
    ["sign", "--mode", "anyone", "--input", plistPath, "--output", outputPath],
    {
      stdio: "pipe",
      timeout: 30000,
    },
  );

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim() ?? "";
    throw new Error(`shortcuts sign failed (exit ${result.status}): ${stderr}`);
  }
}
