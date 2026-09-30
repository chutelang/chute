import { describe, it, expect } from "vitest";
import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const pkgDir = path.resolve(import.meta.dirname, "../..");
const grammarPath = path.join(pkgDir, "syntaxes/chute.tmLanguage.json");
const casesDir = path.join(pkgDir, "tests/grammar/cases");

const cases = fs.readdirSync(casesDir).filter((f) => f.endsWith(".chute"));

describe("TextMate grammar", () => {
  for (const file of cases) {
    it(`should tokenize ${file} correctly`, () => {
      const result = cp.spawnSync(
        "npx",
        ["vscode-tmgrammar-test", "-g", grammarPath, path.join(casesDir, file)],
        { cwd: pkgDir, encoding: "utf-8", timeout: 30_000 },
      );
      if (result.status !== 0) {
        expect.fail(result.stdout + "\n" + result.stderr);
      }
    });
  }
});
