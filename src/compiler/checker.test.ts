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

  describe("var declarations", () => {
    it("should accept var declaration", () => {
      expect(() => checkSource("var x = 42;")).not.toThrow();
    });

    it("should accept assignment to var binding", () => {
      expect(() =>
        checkSource(`
          var x = 1;
          x = 2;
        `),
      ).not.toThrow();
    });

    it("should reject assignment with incompatible type", () => {
      expect(() =>
        checkSource(`
          var x = 1;
          x = "hello";
        `),
      ).toThrow(CheckError);
    });
  });

  describe("assignment", () => {
    it("should reject assignment to undefined variable", () => {
      expect(() => checkSource("x = 1;")).toThrow(CheckError);
    });
  });

  describe("arithmetic", () => {
    it("should accept arithmetic on numbers", () => {
      expect(() =>
        checkSource(`
          let a = 1;
          let b = 2;
          let c = a + b;
        `),
      ).not.toThrow();
    });

    it("should reject arithmetic on strings", () => {
      expect(() =>
        checkSource(`
          let a = "x";
          let b = a + 1;
        `),
      ).toThrow(CheckError);
    });

    it("should accept unary negation on numbers", () => {
      expect(() =>
        checkSource(`
          let a = 1;
          let b = -a;
        `),
      ).not.toThrow();
    });

    it("should reject unary negation on strings", () => {
      expect(() =>
        checkSource(`
          let a = "x";
          let b = -a;
        `),
      ).toThrow(CheckError);
    });
  });

  describe("nil coalescing", () => {
    it("should accept ?? with optional left operand", () => {
      expect(() =>
        checkSource(`
          let a: Number? = nil;
          let b = a ?? 0;
        `),
      ).not.toThrow();
    });

    it("should produce non-optional result from ??", () => {
      expect(() =>
        checkSource(`
          let a: Number? = nil;
          let b = a ?? 0;
          let c = b + 1;
        `),
      ).not.toThrow();
    });

    it("should reject ?? with non-optional left operand", () => {
      expect(() =>
        checkSource(`
          let a = 1;
          let b = a ?? 0;
        `),
      ).toThrow(CheckError);
    });

    it("should reject ?? with incompatible right operand type", () => {
      expect(() =>
        checkSource(`
          let a: Number? = nil;
          let b = a ?? "hello";
        `),
      ).toThrow(CheckError);
    });
  });

  describe("optional types", () => {
    it("should accept nil assigned to optional", () => {
      expect(() => checkSource("let x: Number? = nil;")).not.toThrow();
    });

    it("should reject nil assigned to non-optional", () => {
      expect(() => checkSource("let x: Number = nil;")).toThrow(CheckError);
    });
  });
});
