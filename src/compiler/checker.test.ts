import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { check, CheckError } from "./checker.ts";
import type { Program } from "./ast.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function checkSource(source: string): void {
  check(parse(source));
}

describe("checker", () => {
  describe("let declarations", () => {
    it("should accept let with matching type annotation", () => {
      expect(() => checkSource('let x: Text = "hello";')).not.toThrow();
    });

    it("should accept let without type annotation", () => {
      expect(() => checkSource("let x = 42;")).not.toThrow();
    });

    it("should reject let with mismatched type annotation", () => {
      expect(() => checkSource('let x: Number = "hello";')).toThrow(CheckError);
    });

    it("should reject assignment to let binding", () => {
      expect(() =>
        checkSource(`
          let x = 1;
          x = 2;
        `),
      ).toThrow(CheckError);
    });

    it("should reject duplicate variable in same scope", () => {
      expect(() =>
        checkSource(`
          let x = 1;
          let x = 2;
        `),
      ).toThrow(CheckError);
    });
  });
});
