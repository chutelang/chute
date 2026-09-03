import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { IO } from "../io.ts";
import { run } from "./run.ts";

const TEST_DIR = path.join(import.meta.dirname, "__test_run__");

const SAMPLE_SOURCE = `import Notification;
shortcut {
  name: "Test",
}

Notification.showAlert(WFAlertActionTitle: "hello");
`;

interface FakeIOResult {
  io: IO;
  stderrLines: string[];
  exitCode: number | undefined;
  spawnCalls: Array<{ command: string; args: string[] }>;
}

function createFakeIO(options?: {
  signingAvailable?: boolean;
  signShouldThrow?: boolean;
  openExitCode?: number;
}): FakeIOResult {
  const stderrLines: string[] = [];
  const spawnCalls: Array<{ command: string; args: string[] }> = [];
  let exitCode: number | undefined;

  const io: IO = {
    fileExists: (p) => fs.existsSync(p),
    readFile: (p) => fs.readFileSync(p, "utf-8"),
    readDir: (p) => fs.readdirSync(p, { recursive: true }).map(String),
    writeFile: (p, data) => fs.writeFileSync(p, data),
    removeFile: (p) => fs.unlinkSync(p),
    spawn: (command, args) => {
      spawnCalls.push({
        command,
        args,
      });
      if (command === "shortcuts" && args[0] === "sign" && args[1] === "--help") {
        return {
          status: options?.signingAvailable ? 0 : 1,
          stderr: Buffer.from(""),
        };
      }
      if (command === "shortcuts" && args[0] === "sign" && args[1] === "--mode") {
        if (options?.signShouldThrow) {
          return {
            status: 1,
            stderr: Buffer.from("bad input"),
          };
        }
        const inputPath = args[args.indexOf("--input") + 1] ?? "";
        const outputPath = args[args.indexOf("--output") + 1] ?? "";
        fs.writeFileSync(outputPath, fs.readFileSync(inputPath));
        return {
          status: 0,
          stderr: Buffer.from(""),
        };
      }
      if (command === "open") {
        return {
          status: options?.openExitCode ?? 0,
          stderr: Buffer.from(""),
        };
      }
      return {
        status: 0,
        stderr: Buffer.from(""),
      };
    },
    stdout: () => {},
    stderr: (msg) => stderrLines.push(msg),
    setExitCode: (code) => {
      exitCode = code;
    },
    stderrSupportsColor: false,
  };

  return {
    io,
    stderrLines,
    get exitCode() {
      return exitCode;
    },
    spawnCalls,
  };
}

describe("chute run", () => {
  beforeEach(() => {
    fs.rmSync(TEST_DIR, {
      recursive: true,
      force: true,
    });
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, {
      recursive: true,
      force: true,
    });
  });

  it("should error when file not found", () => {
    const fake = createFakeIO();
    run("nonexistent.chute", fake.io);
    expect(fake.exitCode).toBe(1);
  });

  it("should error with warning when signing is unavailable", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({ signingAvailable: false });
    run(filePath, fake.io);

    expect(fake.exitCode).toBe(1);
    const warning = fake.stderrLines.join("");
    expect(warning).toContain("WARNING");
    expect(warning).toContain("Cannot run unsigned shortcuts");
    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(false);
  });

  it("should clean up plist and error when signing throws", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({
      signingAvailable: true,
      signShouldThrow: true,
    });
    run(filePath, fake.io);

    expect(fake.exitCode).toBe(1);
    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(false);
  });

  it("should build, sign, and open when signing is available", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({ signingAvailable: true });
    run(filePath, fake.io);

    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(false);
    expect(fs.existsSync(path.join(TEST_DIR, "test.shortcut"))).toBe(true);

    const openCall = fake.spawnCalls.find((c) => c.command === "open");
    expect(openCall?.args).toEqual([path.join(TEST_DIR, "test.shortcut")]);
    expect(fake.exitCode).toBeUndefined();
  });

  it("should error when open fails", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({
      signingAvailable: true,
      openExitCode: 1,
    });
    run(filePath, fake.io);

    expect(fake.exitCode).toBe(1);
  });
});
