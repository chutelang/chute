import { describe, it, expect } from "vitest";
import { findServerPath } from "./find-server-path.ts";

describe("findServerPath", () => {
  it("should return the configured path when provided", () => {
    const result = findServerPath({
      configuredPath: "/usr/local/bin/chute",
      isExecutable: () => true,
    });
    expect(result).toBe("/usr/local/bin/chute");
  });

  it("should return 'chute' when no configured path and chute is on PATH", () => {
    const result = findServerPath({
      configuredPath: "",
      isExecutable: () => true,
    });
    expect(result).toBe("chute");
  });

  it("should return null when chute is not found", () => {
    const result = findServerPath({
      configuredPath: "",
      isExecutable: () => false,
    });
    expect(result).toBeNull();
  });

  it("should return null when configured path is not executable", () => {
    const result = findServerPath({
      configuredPath: "/bad/path/chute",
      isExecutable: () => false,
    });
    expect(result).toBeNull();
  });
});
