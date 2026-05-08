import { describe, expect, it } from "vitest";
import type { Spawn } from "./io.ts";
import { isSigningAvailable, signShortcut } from "./sign.ts";

function fakeSpawn(status: number): Spawn {
  return () => ({
    status,
    stderr: Buffer.from(""),
  });
}

describe("isSigningAvailable", () => {
  it("should return true when shortcuts sign --help exits 0", () => {
    const calls: Array<{ command: string; args: string[] }> = [];
    const spawn: Spawn = (command, args) => {
      calls.push({
        command,
        args,
      });
      return {
        status: 0,
        stderr: Buffer.from(""),
      };
    };

    expect(isSigningAvailable(spawn)).toBe(true);
    expect(calls).toEqual([
      {
        command: "shortcuts",
        args: ["sign", "--help"],
      },
    ]);
  });

  it("should return false when shortcuts sign --help exits non-zero", () => {
    expect(isSigningAvailable(fakeSpawn(1))).toBe(false);
  });

  it("should return false when spawn throws (command not found)", () => {
    const spawn: Spawn = () => {
      throw new Error("ENOENT");
    };

    expect(isSigningAvailable(spawn)).toBe(false);
  });
});

describe("signShortcut", () => {
  it("should call spawn with correct arguments", () => {
    const calls: Array<{ command: string; args: string[] }> = [];
    const spawn: Spawn = (command, args) => {
      calls.push({
        command,
        args,
      });
      return {
        status: 0,
        stderr: Buffer.from(""),
      };
    };

    signShortcut(spawn, "/tmp/test.plist", "/tmp/test.shortcut");

    expect(calls).toEqual([
      {
        command: "shortcuts",
        args: [
          "sign",
          "--mode",
          "anyone",
          "--input",
          "/tmp/test.plist",
          "--output",
          "/tmp/test.shortcut",
        ],
      },
    ]);
  });

  it("should throw when shortcuts sign fails", () => {
    const spawn: Spawn = () => ({
      status: 1,
      stderr: Buffer.from("signing failed"),
    });

    expect(() => signShortcut(spawn, "/tmp/test.plist", "/tmp/test.shortcut")).toThrow(
      "shortcuts sign failed (exit 1): signing failed",
    );
  });
});
