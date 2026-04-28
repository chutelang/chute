import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { init } from "./init.ts";

const TEST_DIR = path.join(import.meta.dirname, "__test_init__");

describe("chute init", () => {
  beforeEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should create chute.json, src/main.chute, and .gitignore", () => {
    init(TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, "chute.json"))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, "src", "main.chute"))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, ".gitignore"))).toBe(true);
  });

  it("should write valid JSON to chute.json", () => {
    init(TEST_DIR);

    const raw = fs.readFileSync(path.join(TEST_DIR, "chute.json"), "utf-8");
    const config = JSON.parse(raw) as Record<string, unknown>;

    expect(config).toMatchObject({
      $schema: "https://chute-lang.dev/schema/chute.schema.json",
      name: "__test_init__",
      version: "1.0.0",
      sourceDir: "./src",
      outDir: "./build",
      sign: true,
    });
  });

  it("should write a shortcut block in main.chute", () => {
    init(TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, "src", "main.chute"), "utf-8");
    expect(content).toContain("shortcut {");
  });

  it("should include build/ in .gitignore", () => {
    init(TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, ".gitignore"), "utf-8");
    expect(content).toContain("build/");
  });

  it("should refuse to overwrite an existing chute.json", () => {
    init(TEST_DIR);
    process.exitCode = undefined;

    init(TEST_DIR);

    expect(process.exitCode).toBe(1);
  });
});
