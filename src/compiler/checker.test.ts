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

  describe("optional chaining", () => {
    it("should reject ?. on non-optional", () => {
      expect(() =>
        checkSource(`
          let d = {"name": "Alice"};
          let n = d?.name;
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

  describe("string interpolation", () => {
    it("should type interpolated strings as Text", () => {
      expect(() =>
        checkSource(`
          let name = "world";
          let greeting: Text = "hello \${name}";
        `),
      ).not.toThrow();
    });
  });

  describe("list literals", () => {
    it("should accept homogeneous list", () => {
      expect(() => checkSource("let xs = [1, 2, 3];")).not.toThrow();
    });

    it("should accept empty list", () => {
      expect(() => checkSource("let xs = [];")).not.toThrow();
    });
  });

  describe("dictionary literals", () => {
    it("should accept dictionary literal", () => {
      expect(() => checkSource('let d = {"name": "Alice", "age": 30};')).not.toThrow();
    });

    it("should accept empty dictionary", () => {
      expect(() => checkSource("let d = {:};")).not.toThrow();
    });
  });

  describe("expression statements", () => {
    it("should accept action calls", () => {
      expect(() => checkSource('showAlert(text: "hello");')).not.toThrow();
    });
  });

  describe("if statements", () => {
    it("should accept if with comparison condition", () => {
      expect(() =>
        checkSource(`
          let x = 5;
          if x > 3 { showAlert(text: "big"); }
        `),
      ).not.toThrow();
    });

    it("should accept if/else", () => {
      expect(() =>
        checkSource(`
          let x = 5;
          if x > 3 { showAlert(text: "big"); } else { showAlert(text: "small"); }
        `),
      ).not.toThrow();
    });

    it("should scope variables to if body", () => {
      expect(() =>
        checkSource(`
          if true {
            let y = 1;
          }
          let z = y + 1;
        `),
      ).toThrow(CheckError);
    });

    it("should scope variables to else body", () => {
      expect(() =>
        checkSource(`
          if true {
            showAlert(text: "a");
          } else {
            let y = 1;
          }
          let z = y + 1;
        `),
      ).toThrow(CheckError);
    });
  });

  describe("for statements", () => {
    it("should accept for loop over list", () => {
      expect(() =>
        checkSource(`
          let items = [1, 2, 3];
          for item in items { showAlert(text: "go"); }
        `),
      ).not.toThrow();
    });

    it("should reject for loop over non-list", () => {
      expect(() =>
        checkSource(`
          let x = 5;
          for item in x { showAlert(text: "go"); }
        `),
      ).toThrow(CheckError);
    });

    it("should type loop variable from list element type", () => {
      expect(() =>
        checkSource(`
          let items = [1, 2, 3];
          for item in items {
            let y = item + 1;
          }
        `),
      ).not.toThrow();
    });

    it("should scope loop variable to loop body", () => {
      expect(() =>
        checkSource(`
          let items = [1, 2, 3];
          for item in items { showAlert(text: "go"); }
          let x = item + 1;
        `),
      ).toThrow(CheckError);
    });
  });

  describe("repeat statements", () => {
    it("should accept repeat with number", () => {
      expect(() => checkSource('repeat 5 { showAlert(text: "go"); }')).not.toThrow();
    });

    it("should reject repeat with non-number", () => {
      expect(() =>
        checkSource(`
          let s = "hello";
          repeat s { showAlert(text: "go"); }
        `),
      ).toThrow(CheckError);
    });
  });

  describe("menu statements", () => {
    it("should accept menu with cases", () => {
      expect(() =>
        checkSource(`
          menu "Pick" {
            case "A" { showAlert(text: "a"); }
            case "B" { showAlert(text: "b"); }
          }
        `),
      ).not.toThrow();
    });
  });

  describe("ternary expressions", () => {
    it("should type ternary from branches", () => {
      expect(() =>
        checkSource(`
          let x = 5;
          let y: Number = x > 3 ? 1 : 0;
        `),
      ).not.toThrow();
    });

    it("should reject mismatched ternary assigned to typed variable", () => {
      expect(() =>
        checkSource(`
          let x = 5;
          let y: Number = x > 3 ? "yes" : "no";
        `),
      ).toThrow(CheckError);
    });
  });

  describe("nil narrowing", () => {
    it("should narrow optional to non-optional in != nil branch", () => {
      expect(() =>
        checkSource(`
          let x: Number? = nil;
          if x != nil {
            let y = x + 1;
          }
        `),
      ).not.toThrow();
    });

    it("should narrow optional to nil in == nil branch's else", () => {
      expect(() =>
        checkSource(`
          let x: Number? = nil;
          if x == nil {
            showAlert(text: "nil");
          } else {
            let y = x + 1;
          }
        `),
      ).not.toThrow();
    });
  });

  describe("#index", () => {
    it("should type #index as number", () => {
      expect(() =>
        checkSource(`
          let items = [1, 2, 3];
          for item in items {
            let idx = #index + 1;
          }
        `),
      ).not.toThrow();
    });
  });
});
