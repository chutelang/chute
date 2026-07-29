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

  it("should error when fmt has no files to format", async () => {
    await run("fmt");
    expect(process.exitCode).toBe(1);
  });

  it("should register the lsp command", () => {
    const program = createProgram();
    const lspCommand = program.commands.find((c) => c.name() === "lsp");
    expect(lspCommand).toBeDefined();
    expect(lspCommand?.description()).toBe("Start the language server");
  });
});
