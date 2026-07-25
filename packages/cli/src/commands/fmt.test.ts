import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { IO } from "../io.ts";
import { fmt } from "./fmt.ts";

const TEST_DIR = path.join(import.meta.dirname, "__test_fmt__");

const UNFORMATTED = `let   x  =  1 ;
let   y  =  2 ;
`;

const FORMATTED = `let x = 1;
let y = 2;
`;

interface FakeIOResult {
  io: IO;
  stdoutLines: string[];
  stderrLines: string[];
  exitCode: number | undefined;
}

function createFakeIO(): FakeIOResult {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  let exitCode: number | undefined;

  const io: IO = {
    fileExists: (p) => fs.existsSync(p),
    readFile: (p) => fs.readFileSync(p, "utf-8"),
    readDir: (p) => fs.readdirSync(p, { recursive: true }).map(String),
    writeFile: (p, data) => fs.writeFileSync(p, data),
    removeFile: (p) => fs.unlinkSync(p),
    spawn: () => ({
      status: 0,
      stderr: Buffer.from(""),
    }),
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
  };
}

describe("chute fmt", () => {
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

  it("should format a file in-place", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, UNFORMATTED);

    const fake = createFakeIO();
    fmt([filePath], { check: false }, fake.io);

    expect(fs.readFileSync(filePath, "utf-8")).toBe(FORMATTED);
    expect(fake.exitCode).toBeUndefined();
  });

  it("should not touch an already-formatted file", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, FORMATTED);

    const fake = createFakeIO();
    fmt([filePath], { check: false }, fake.io);

    expect(fs.readFileSync(filePath, "utf-8")).toBe(FORMATTED);
    expect(fake.exitCode).toBeUndefined();
  });

  it("should exit nonzero in --check mode when changes needed", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, UNFORMATTED);

    const fake = createFakeIO();
    fmt([filePath], { check: true }, fake.io);

    expect(fs.readFileSync(filePath, "utf-8")).toBe(UNFORMATTED);
    expect(fake.exitCode).toBe(1);
    expect(fake.stdoutLines.join("")).toContain("test.chute");
  });

  it("should exit cleanly in --check mode when no changes needed", () => {
    const filePath = path.join(TEST_DIR, "test.chute");
    fs.writeFileSync(filePath, FORMATTED);

    const fake = createFakeIO();
    fmt([filePath], { check: true }, fake.io);

    expect(fake.exitCode).toBeUndefined();
  });

  it("should error when file not found", () => {
    const fake = createFakeIO();
    fmt(["nonexistent.chute"], { check: false }, fake.io);

    expect(fake.exitCode).toBe(1);
    expect(fake.stderrLines.join("")).toContain("file not found");
  });

  it("should discover files from sourceDir when no args given", () => {
    const srcDir = path.join(TEST_DIR, "src");
    fs.mkdirSync(srcDir);
    const filePath = path.join(srcDir, "main.chute");
    fs.writeFileSync(filePath, UNFORMATTED);
    fs.writeFileSync(path.join(TEST_DIR, "chute.json"), JSON.stringify({ name: "test" }));

    const fake = createFakeIO();
    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    try {
      fmt([], { check: false }, fake.io);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.readFileSync(filePath, "utf-8")).toBe(FORMATTED);
  });

  it("should use custom sourceDir from chute.json", () => {
    const srcDir = path.join(TEST_DIR, "lib");
    fs.mkdirSync(srcDir);
    const filePath = path.join(srcDir, "main.chute");
    fs.writeFileSync(filePath, UNFORMATTED);
    fs.writeFileSync(
      path.join(TEST_DIR, "chute.json"),
      JSON.stringify({
        name: "test",
        sourceDir: "./lib",
      }),
    );

    const fake = createFakeIO();
    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    try {
      fmt([], { check: false }, fake.io);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.readFileSync(filePath, "utf-8")).toBe(FORMATTED);
  });

  it("should error when no files found in sourceDir", () => {
    fs.writeFileSync(path.join(TEST_DIR, "chute.json"), JSON.stringify({ name: "test" }));

    const fake = createFakeIO();
    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    try {
      fmt([], { check: false }, fake.io);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fake.exitCode).toBe(1);
    expect(fake.stderrLines.join("")).toContain("no .chute files found");
  });

  it("should handle parse errors gracefully", () => {
    const filePath = path.join(TEST_DIR, "bad.chute");
    fs.writeFileSync(filePath, "let x = @@@;");

    const fake = createFakeIO();
    fmt([filePath], { check: false }, fake.io);

    expect(fake.exitCode).toBe(1);
    expect(fake.stderrLines.join("")).toContain("parse error");
  });

  it("should format multiple files", () => {
    const fileA = path.join(TEST_DIR, "a.chute");
    const fileB = path.join(TEST_DIR, "b.chute");
    fs.writeFileSync(fileA, UNFORMATTED);
    fs.writeFileSync(fileB, 'showAlert( text :  "hi" )  ;');

    const fake = createFakeIO();
    fmt([fileA, fileB], { check: false }, fake.io);

    expect(fs.readFileSync(fileA, "utf-8")).toBe(FORMATTED);
    expect(fs.readFileSync(fileB, "utf-8")).toBe('showAlert(text: "hi");\n');
  });

  it("should discover files in subdirectories", () => {
    const srcDir = path.join(TEST_DIR, "src");
    const subDir = path.join(srcDir, "sub");
    fs.mkdirSync(subDir, { recursive: true });
    const filePath = path.join(subDir, "nested.chute");
    fs.writeFileSync(filePath, UNFORMATTED);
    fs.writeFileSync(path.join(TEST_DIR, "chute.json"), JSON.stringify({ name: "test" }));

    const fake = createFakeIO();
    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    try {
      fmt([], { check: false }, fake.io);
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.readFileSync(filePath, "utf-8")).toBe(FORMATTED);
  });
});
