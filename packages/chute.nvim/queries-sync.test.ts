import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const treeSitterQueries = path.resolve(import.meta.dirname, "../tree-sitter-chute/queries");

const nvimQueries = path.resolve(import.meta.dirname, "queries/chute");

describe("chute.nvim query sync", () => {
  it("should have the same set of query files as tree-sitter-chute", () => {
    const sourceFiles = fs
      .readdirSync(treeSitterQueries)
      .filter((f) => f.endsWith(".scm"))
      .sort();

    const vendoredFiles = fs
      .readdirSync(nvimQueries)
      .filter((f) => f.endsWith(".scm"))
      .sort();

    expect(vendoredFiles).toEqual(sourceFiles);
  });

  it("should have identical content for each query file", () => {
    const files = fs.readdirSync(treeSitterQueries).filter((f) => f.endsWith(".scm"));

    for (const file of files) {
      const source = fs.readFileSync(path.join(treeSitterQueries, file), "utf-8");
      const vendored = fs.readFileSync(path.join(nvimQueries, file), "utf-8");
      expect(vendored, `${file} is out of sync with tree-sitter-chute`).toBe(source);
    }
  });
});
