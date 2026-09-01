import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { IO } from "../io.ts";
import { build } from "./build.ts";

const TEST_DIR = path.join(import.meta.dirname, "__test_build__");

const SAMPLE_SOURCE = `shortcut {
  name: "Test",
}

showAlert(text: "hello");
`;

interface FakeIOResult {
  io: IO;
  stdoutLines: string[];
  stderrLines: string[];
  exitCode: number | undefined;
  spawnCalls: Array<{ command: string; args: string[] }>;
}

function createFakeIO(options?: {
  signingAvailable?: boolean;
  signShouldThrow?: boolean;
}): FakeIOResult {
  const stdoutLines: string[] = [];
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
      return {
        status: 0,
        stderr: Buffer.from(""),
      };
    },
    stdout: (msg) => stdoutLines.push(msg),
    stderr: (msg) => stderrLines.push(msg),
    setExitCode: (code) => {
      exitCode = code;
    },
    stderrSupportsColor: false,
  };

  return {
    io,
    stdoutLines,
    stderrLines,
    get exitCode() {
      return exitCode;
    },
    spawnCalls,
  };
}

describe("chute build", () => {
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

  it("should error when no input files are given", () => {
    const fake = createFakeIO();
    build([], { sign: true }, fake.io);
    expect(fake.exitCode).toBe(1);
    expect(fake.stderrLines.join("")).toContain("no input files");
  });

  it("should error when file not found", () => {
    const fake = createFakeIO();
    build(["nonexistent.chute"], { sign: true }, fake.io);
    expect(fake.exitCode).toBe(1);
    expect(fake.stderrLines.join("")).toContain("file not found");
  });

  it("should produce .plist when --no-sign is passed", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({ signingAvailable: true });
    build([filePath], { sign: false }, fake.io);

    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(true);
    expect(fake.spawnCalls).toEqual([]);
  });

  it("should sign and produce .shortcut when signing is available", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({ signingAvailable: true });
    build([filePath], { sign: true }, fake.io);

    expect(fs.existsSync(path.join(TEST_DIR, "test.shortcut"))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(false);
    expect(fake.stdoutLines.join("")).toContain("test.shortcut");
  });

  it("should fall back to .plist with warning when signing unavailable", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);

    const fake = createFakeIO({ signingAvailable: false });
    build([filePath], { sign: true }, fake.io);

    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(true);
    const warning = fake.stderrLines.join("");
    expect(warning).toContain("WARNING");
    expect(warning).toContain("shortcuts sign");
  });

  it("should respect sign: false in chute.json", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, SAMPLE_SOURCE);
    fs.writeFileSync(
      path.join(TEST_DIR, "chute.json"),
      JSON.stringify({
        name: "test",
        sign: false,
      }),
    );

    const fake = createFakeIO({ signingAvailable: true });

    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    try {
      build([filePath], { sign: true }, fake.io);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.existsSync(path.join(TEST_DIR, "test.plist"))).toBe(true);
    expect(fake.spawnCalls).toEqual([]);
  });

  it("should render diagnostics on compile error", () => {
    const filePath = path.join(TEST_DIR, "bad.chute");
    fs.writeFileSync(
      filePath,
      `shortcut { name: "Bad" }
const x = foo;
`,
    );

    const fake = createFakeIO();
    build([filePath], { sign: false }, fake.io);

    expect(fake.exitCode).toBe(1);
    const stderr = fake.stderrLines.join("");
    expect(stderr).toContain("CHT");
    expect(stderr).toContain("error");
    expect(stderr).toContain("emitted");
  });

  it("should clean up plist and continue when signing throws", () => {
    const fileA = path.join(TEST_DIR, "a.chute");
    const fileB = path.join(TEST_DIR, "b.chute");
    fs.writeFileSync(fileA, SAMPLE_SOURCE);
    fs.writeFileSync(fileB, SAMPLE_SOURCE);

    const fake = createFakeIO({
      signingAvailable: true,
      signShouldThrow: true,
    });
    build([fileA, fileB], { sign: true }, fake.io);

    expect(fake.exitCode).toBe(1);
    expect(fs.existsSync(path.join(TEST_DIR, "a.plist"))).toBe(false);
    expect(fs.existsSync(path.join(TEST_DIR, "b.plist"))).toBe(false);
  });
});
