import { describe, expect, it } from "vitest";
import type { IO, Spawn } from "./io.ts";
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

function fakeIO(spawn: Spawn): {
  io: IO;
  writes: Array<{ path: string; data: string }>;
  removals: string[];
} {
  const writes: Array<{ path: string; data: string }> = [];
  const removals: string[] = [];
  const io = {
    writeFile: (p: string, data: string) => {
      writes.push({
        path: p,
        data,
      });
    },
    removeFile: (p: string) => {
      removals.push(p);
    },
    spawn,
  } as unknown as IO;

  return {
    io,
    writes,
    removals,
  };
}

describe("signShortcut", () => {
  it("should stage plist as .unsigned.shortcut and sign it", () => {
    const calls: Array<{ command: string; args: string[] }> = [];
    const fake = fakeIO((command, args) => {
      calls.push({
        command,
        args,
      });
      return {
        status: 0,
        stderr: Buffer.from(""),
      };
    });

    signShortcut(fake.io, "<plist/>", "/tmp/test.shortcut");

    expect(fake.writes).toEqual([
      {
        path: "/tmp/test.unsigned.shortcut",
        data: "<plist/>",
      },
    ]);
    expect(calls).toEqual([
      {
        command: "shortcuts",
        args: [
          "sign",
          "--mode",
          "anyone",
          "--input",
          "/tmp/test.unsigned.shortcut",
          "--output",
          "/tmp/test.shortcut",
        ],
      },
    ]);
    expect(fake.removals).toEqual(["/tmp/test.unsigned.shortcut"]);
  });

  it("should throw and clean up staged file when signing fails", () => {
    const fake = fakeIO(() => ({
      status: 1,
      stderr: Buffer.from("signing failed"),
    }));

    expect(() => signShortcut(fake.io, "<plist/>", "/tmp/test.shortcut")).toThrow(
      "shortcuts sign failed (exit 1): signing failed",
    );
    expect(fake.removals).toEqual(["/tmp/test.unsigned.shortcut"]);
  });
});
