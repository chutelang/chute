#!/usr/bin/env node

import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..", "..", "..");
const TREE_SITTER = join(import.meta.dirname, "..", "node_modules", ".bin", "tree-sitter");
const GRAMMAR_DIR = join(import.meta.dirname, "..");

// Tree-sitter CLI 0.24.x can't read `parse` input from standard input. Write
// each source to a temporary `.chute` file and pass its path instead.
const SCRATCH_DIR = mkdtempSync(join(tmpdir(), "tree-sitter-chute-parse-"));

let failures = 0;
let total = 0;

function parseSource(name, source) {
  total++;
  const scratchFile = join(SCRATCH_DIR, "scratch.chute");
  writeFileSync(scratchFile, source, "utf-8");
  try {
    const result = execFileSync(TREE_SITTER, ["parse", scratchFile], {
      cwd: GRAMMAR_DIR,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (result.includes("ERROR") || result.includes("MISSING")) {
      console.error(`FAIL: ${name}`);
      console.error(
        result
          .split("\n")
          .filter((l) => l.includes("ERROR") || l.includes("MISSING"))
          .join("\n"),
      );
      failures++;
    }
  } catch (e) {
    console.error(`FAIL: ${name} — ${e.message}`);
    failures++;
  }
}

// Parse the example programs.
const examplesDir = join(ROOT, "examples");
for (const file of readdirSync(examplesDir).filter((f) => f.endsWith(".chute"))) {
  const source = readFileSync(join(examplesDir, file), "utf-8");
  parseSource(`examples/${file}`, source);
}

// Parse the simulator test cases.
const testCases = JSON.parse(
  readFileSync(join(ROOT, "tools/simulator-test/test-cases.json"), "utf-8"),
);
for (const tc of testCases) {
  parseSource(`test-case/${tc.name}`, tc.source);
}

rmSync(SCRATCH_DIR, { recursive: true, force: true });

console.log(`\n${total - failures}/${total} passed`);
if (failures > 0) {
  process.exit(1);
}
