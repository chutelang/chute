import * as path from "node:path";
import { compile } from "../../compiler/pipeline.ts";
import { type IO, realIO } from "../io.ts";
import { isSigningAvailable, signShortcut } from "../sign.ts";

export interface BuildOptions {
  sign: boolean;
}

export function build(files: string[], options: BuildOptions, io: IO = realIO): void {
  if (files.length === 0) {
    io.stderr("chute build: no input files\n");
    io.setExitCode(1);
    return;
  }

  const shouldSign = resolveSignFlag(options.sign, io);
  const signingAvailable = shouldSign && isSigningAvailable(io.spawn);

  if (shouldSign && !signingAvailable) {
    io.stderr(
      "\n" +
        "  ⚠ WARNING: `shortcuts sign` is not available.\n" +
        "  Signing requires macOS with the Shortcuts CLI installed.\n" +
        "  Falling back to unsigned .plist output.\n\n",
    );
  }

  for (const file of files) {
    buildFile(file, signingAvailable, io);
  }
}

function resolveSignFlag(cliSign: boolean, io: IO): boolean {
  if (!cliSign) return false;

  const config = readChuteJson(io);
  if (config !== undefined && typeof config.sign === "boolean") {
    return config.sign;
  }

  return true;
}

function readChuteJson(io: IO): Record<string, unknown> | undefined {
  const configPath = path.resolve("chute.json");
  if (!io.fileExists(configPath)) return undefined;

  try {
    const raw = io.readFile(configPath);
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function buildFile(file: string, sign: boolean, io: IO): void {
  const resolved = path.resolve(file);

  if (!io.fileExists(resolved)) {
    io.stderr(`chute build: file not found: ${file}\n`);
    io.setExitCode(1);
    return;
  }

  const source = io.readFile(resolved);
  const plist = compile(source);

  const outDir = path.dirname(resolved);
  const baseName = path.basename(resolved, ".chute");
  const plistPath = path.join(outDir, `${baseName}.plist`);

  io.writeFile(plistPath, plist);

  if (sign) {
    const shortcutPath = path.join(outDir, `${baseName}.shortcut`);
    try {
      signShortcut(io.spawn, plistPath, shortcutPath);
    } catch (err) {
      io.removeFile(plistPath);
      io.stderr(
        `chute build: signing failed for ${file}: ${err instanceof Error ? err.message : err}\n`,
      );
      io.setExitCode(1);
      return;
    }
    io.removeFile(plistPath);
    io.stdout(`${shortcutPath}\n`);
  } else {
    io.stdout(`${plistPath}\n`);
  }
}
