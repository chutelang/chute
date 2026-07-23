import * as path from "node:path";
import { format } from "../../compiler/formatter.ts";
import { CompileError } from "../../compiler/diagnostic.ts";
import { type IO, realIO } from "../io.ts";

export interface FmtOptions {
  check: boolean;
}

export function fmt(files: string[], options: FmtOptions, io: IO = realIO): void {
  const config = readChuteJson(io);

  if (files.length === 0) {
    files = discoverFiles(config, io);
    if (files.length === 0) {
      io.stderr("chute fmt: no .chute files found\n");
      io.setExitCode(1);
      return;
    }
  }

  let hasChanges = false;

  for (const file of files) {
    const changed = formatFile(file, options, io);
    if (changed) {
      hasChanges = true;
    }
  }

  if (options.check && hasChanges) {
    io.setExitCode(1);
  }
}

function discoverFiles(config: Record<string, unknown> | undefined, io: IO): string[] {
  const sourceDir = typeof config?.sourceDir === "string" ? config.sourceDir : "./src";
  const resolved = path.resolve(sourceDir);

  if (!io.fileExists(resolved)) {
    return [];
  }

  const entries = io.readDir(resolved);
  return entries
    .filter((entry) => entry.endsWith(".chute"))
    .map((entry) => path.join(resolved, entry));
}

function readChuteJson(io: IO): Record<string, unknown> | undefined {
  const configPath = path.resolve("chute.json");
  if (!io.fileExists(configPath)) {
    return undefined;
  }

  try {
    const raw = io.readFile(configPath);
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function formatFile(file: string, options: FmtOptions, io: IO): boolean {
  const resolved = path.resolve(file);

  if (!io.fileExists(resolved)) {
    io.stderr(`chute fmt: file not found: ${file}\n`);
    io.setExitCode(1);
    return false;
  }

  const source = io.readFile(resolved);
  let formatted: string;
  try {
    formatted = format(source);
  } catch (e) {
    if (e instanceof CompileError) {
      io.stderr(`chute fmt: ${file}: parse error\n`);
      io.setExitCode(1);
      return false;
    }
    throw e;
  }

  if (source === formatted) {
    return false;
  }

  if (options.check) {
    io.stdout(`${file}\n`);
    return true;
  }

  io.writeFile(resolved, formatted);
  return false;
}
