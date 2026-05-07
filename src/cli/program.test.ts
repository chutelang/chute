import { describe, expect, it, vi, beforeEach } from "vitest";
import { createProgram } from "./program.ts";

function run(...args: Array<string>) {
  const program = createProgram();
  program.exitOverride();
  program.configureOutput({
    writeOut: vi.fn(),
    writeErr: vi.fn(),
  });
  return program.parseAsync(["node", "chute", ...args]);
}

describe("chute CLI", () => {
  beforeEach(() => {
    process.exitCode = undefined;
  });

  it("should print version with -v", async () => {
    await expect(run("-v")).rejects.toThrow();
  });

  it("should print help with --help", async () => {
    await expect(run("--help")).rejects.toThrow();
  });

  it("should exit with error for unknown command", async () => {
    await expect(run("bogus")).rejects.toThrow();
  });

  it("should error when build has no input files", async () => {
    await run("build");
    expect(process.exitCode).toBe(1);
  });

  it("should stub check as not yet implemented", async () => {
    await run("check");
    expect(process.exitCode).toBe(1);
  });

  it("should stub fmt as not yet implemented", async () => {
    await run("fmt");
    expect(process.exitCode).toBe(1);
  });

  it("should stub lsp as not yet implemented", async () => {
    await run("lsp");
    expect(process.exitCode).toBe(1);
  });
});
