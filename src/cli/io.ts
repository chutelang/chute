import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as tty from "node:tty";

export interface SpawnResult {
  status: number | null;
  stderr?: Buffer | null;
}

export type Spawn = (
  command: string,
  args: string[],
  options?: {
    stdio?: "pipe" | "inherit";
    timeout?: number;
  },
) => SpawnResult;

export interface IO {
  fileExists(path: string): boolean;
  readFile(path: string): string;
  writeFile(path: string, data: string): void;
  removeFile(path: string): void;
  spawn: Spawn;
  stdout(msg: string): void;
  stderr(msg: string): void;
  setExitCode(code: number): void;
  stderrSupportsColor: boolean;
}

export const realIO: IO = {
  fileExists: (p) => fs.existsSync(p),
  readFile: (p) => fs.readFileSync(p, "utf-8"),
  writeFile: (p, data) => fs.writeFileSync(p, data),
  removeFile: (p) => fs.unlinkSync(p),
  spawn: (command, args, options) => {
    const result = childProcess.spawnSync(command, args, {
      stdio: options?.stdio,
      timeout: options?.timeout,
    });
    return {
      status: result.status,
      stderr: typeof result.stderr === "string" ? Buffer.from(result.stderr) : result.stderr,
    };
  },
  stdout: (msg) => {
    process.stdout.write(msg);
  },
  stderr: (msg) => {
    process.stderr.write(msg);
  },
  setExitCode: (code) => {
    process.exitCode = code;
  },
  stderrSupportsColor: tty.isatty(2),
};
