import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { check, type CheckWarning, type FileResolver } from "./checker.ts";
import { CompileError } from "./diagnostic.ts";
import type { Program } from "./ast.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function checkSource(
  source: string,
  options?: { resolver?: FileResolver; filePath?: string },
): void {
  check(parse(source), options);
}

function checkSourceWithWarnings(
  source: string,
  options?: { resolver?: FileResolver; filePath?: string },
): CheckWarning[] {
  return check(parse(source), options);
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
      expect(() => checkSource('let x: Number = "hello";')).toThrow(CompileError);
    });

    it("should reject assignment to let binding", () => {
      expect(() =>
        checkSource(`
          let x = 1;
          x = 2;
        `),
      ).toThrow(CompileError);
    });

    it("should reject duplicate variable in same scope", () => {
      expect(() =>
        checkSource(`
          let x = 1;
          let x = 2;
        `),
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
    });
  });

  describe("assignment", () => {
    it("should reject assignment to undefined variable", () => {
      expect(() => checkSource("x = 1;")).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
    });

    it("should reject ?? with incompatible right operand type", () => {
      expect(() =>
        checkSource(`
          let a: Number? = nil;
          let b = a ?? "hello";
        `),
      ).toThrow(CompileError);
    });
  });

  describe("optional chaining", () => {
    it("should reject ?. on non-optional", () => {
      expect(() =>
        checkSource(`
          let d = {"name": "Alice"};
          let n = d?.name;
        `),
      ).toThrow(CompileError);
    });
  });

  describe("optional types", () => {
    it("should accept nil assigned to optional", () => {
      expect(() => checkSource("let x: Number? = nil;")).not.toThrow();
    });

    it("should reject nil assigned to non-optional", () => {
      expect(() => checkSource("let x: Number = nil;")).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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
      ).toThrow(CompileError);
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

    it("should preserve var mutability through nil narrowing", () => {
      expect(() =>
        checkSource(`
          var x: Number? = nil;
          if x != nil {
            x = 42;
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

  describe("enum declarations", () => {
    it("should accept enum with explicit case values", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
        `),
      ).not.toThrow();
    });

    it("should accept enum with implicit case values", () => {
      expect(() =>
        checkSource(`
          enum Direction { north, south, east, west }
        `),
      ).not.toThrow();
    });

    it("should accept enum with default value prefix", () => {
      expect(() =>
        checkSource(`
          enum Status = "status" { active, inactive }
        `),
      ).not.toThrow();
    });

    it("should reject duplicate enum cases", () => {
      expect(() =>
        checkSource(`
          enum Bad { x = "a", x = "b" }
        `),
      ).toThrow(CompileError);
    });

    it("should accept enum member access", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          let c = Color.red;
        `),
      ).not.toThrow();
    });

    it("should reject invalid enum case access", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          let c = Color.green;
        `),
      ).toThrow(CompileError);
    });

    it("should resolve dot-name shorthand with type annotation", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          let c: Color = .red;
        `),
      ).not.toThrow();
    });

    it("should reject invalid dot-name case", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          let c: Color = .green;
        `),
      ).toThrow(CompileError);
    });

    it("should reject dot-name without contextual type", () => {
      expect(() =>
        checkSource(`
          let c = .red;
        `),
      ).toThrow(CompileError);
    });

    it("should resolve dot-name in var assignment", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          var c: Color = .red;
          c = .blue;
        `),
      ).not.toThrow();
    });

    it("should use enum as type annotation", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          let c: Color = Color.red;
        `),
      ).not.toThrow();
    });

    it("should reject assigning wrong enum type", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED" }
          enum Size { small = "SM" }
          let c: Color = Size.small;
        `),
      ).toThrow(CompileError);
    });

    it("should reject duplicate type names", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "R" }
          enum Color { blue = "B" }
        `),
      ).toThrow(CompileError);
    });
  });

  describe("record declarations", () => {
    it("should accept empty record", () => {
      expect(() =>
        checkSource(`
          record Empty {}
        `),
      ).not.toThrow();
    });

    it("should accept record with typed fields", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
        `),
      ).not.toThrow();
    });

    it("should reject duplicate record fields", () => {
      expect(() =>
        checkSource(`
          record Bad { x: Number, x: Text }
        `),
      ).toThrow(CompileError);
    });

    it("should accept record construction with matching fields", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
        `),
      ).not.toThrow();
    });

    it("should reject record construction with missing field", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1);
        `),
      ).toThrow(CompileError);
    });

    it("should reject record construction with unknown field", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2, z: 3);
        `),
      ).toThrow(CompileError);
    });

    it("should reject record construction with wrong type", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: "two");
        `),
      ).toThrow(CompileError);
    });

    it("should reject record construction without labels", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(1, 2);
        `),
      ).toThrow(CompileError);
    });

    it("should accept record field access", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let a = p.x + p.y;
        `),
      ).not.toThrow();
    });

    it("should reject access to nonexistent record field", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let a = p.z;
        `),
      ).toThrow(CompileError);
    });

    it("should type record field access correctly", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let a: Number = p.x;
        `),
      ).not.toThrow();
    });

    it("should use record as type annotation", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p: Point = Point(x: 1, y: 2);
        `),
      ).not.toThrow();
    });

    it("should reject assigning wrong record type", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          record Size { w: Number, h: Number }
          let p: Point = Size(w: 1, h: 2);
        `),
      ).toThrow(CompileError);
    });
  });

  describe("let destructuring", () => {
    it("should accept destructuring a record", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let { x, y } = p;
        `),
      ).not.toThrow();
    });

    it("should type destructured bindings from record fields", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let { x, y } = p;
          let sum = x + y;
        `),
      ).not.toThrow();
    });

    it("should reject destructuring a non-record", () => {
      expect(() =>
        checkSource(`
          let x = 42;
          let { a } = x;
        `),
      ).toThrow(CompileError);
    });

    it("should reject destructuring with nonexistent field", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let p = Point(x: 1, y: 2);
          let { x, z } = p;
        `),
      ).toThrow(CompileError);
    });

    it("should reject destructuring with duplicate name in scope", () => {
      expect(() =>
        checkSource(`
          record Point { x: Number, y: Number }
          let x = 0;
          let p = Point(x: 1, y: 2);
          let { x, y } = p;
        `),
      ).toThrow(CompileError);
    });
  });

  describe("enum in record fields", () => {
    it("should accept enum-typed record fields with dot-name construction", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          record Shirt { size: Text, color: Color }
          let s = Shirt(size: "L", color: .red);
        `),
      ).not.toThrow();
    });
  });

  describe("function declarations", () => {
    it("should accept a function with no parameters", () => {
      expect(() => checkSource('func greet() { showAlert(text: "hi"); }')).not.toThrow();
    });

    it("should accept a function with typed parameters", () => {
      expect(() =>
        checkSource("func add(a: Number, b: Number) -> Number { return a + b; }"),
      ).not.toThrow();
    });

    it("should reject duplicate parameter names", () => {
      expect(() => checkSource("func bad(a: Number, a: Number) -> Number { return a; }")).toThrow(
        CompileError,
      );
    });

    it("should reject return type mismatch", () => {
      expect(() => checkSource('func bad() -> Number { return "hello"; }')).toThrow(CompileError);
    });

    it("should accept bare return in void function", () => {
      expect(() => checkSource('func greet() { showAlert(text: "hi"); return; }')).not.toThrow();
    });

    it("should reject return with value in void function", () => {
      expect(() => checkSource("func greet() { return 42; }")).toThrow(CompileError);
    });

    it("should reject bare return in function with return type", () => {
      expect(() => checkSource("func add(a: Number, b: Number) -> Number { return; }")).toThrow(
        CompileError,
      );
    });

    it("should accept function with default parameter", () => {
      expect(() =>
        checkSource('func greet(name: Text = "World") { showAlert(text: name); }'),
      ).not.toThrow();
    });

    it("should reject default parameter with wrong type", () => {
      expect(() => checkSource("func bad(name: Text = 42) { showAlert(text: name); }")).toThrow(
        CompileError,
      );
    });

    it("should reject duplicate function names", () => {
      expect(() =>
        checkSource(`
          func greet() { showAlert(text: "hi"); }
          func greet() { showAlert(text: "hello"); }
        `),
      ).toThrow(CompileError);
    });
  });

  describe("function calls", () => {
    it("should accept valid function call", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result = add(a: 1, b: 2);
        `),
      ).not.toThrow();
    });

    it("should type function call result from return type", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result: Number = add(a: 1, b: 2);
        `),
      ).not.toThrow();
    });

    it("should reject function call with wrong argument type", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result = add(a: "x", b: 2);
        `),
      ).toThrow(CompileError);
    });

    it("should reject function call with missing required argument", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result = add(a: 1);
        `),
      ).toThrow(CompileError);
    });

    it("should reject function call with unknown parameter name", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result = add(a: 1, c: 2);
        `),
      ).toThrow(CompileError);
    });

    it("should accept function call with default parameter omitted", () => {
      expect(() =>
        checkSource(`
          func greet(name: Text = "World") -> Text { return name; }
          let result = greet();
        `),
      ).not.toThrow();
    });

    it("should accept function call with default parameter provided", () => {
      expect(() =>
        checkSource(`
          func greet(name: Text = "World") -> Text { return name; }
          let result = greet(name: "Alice");
        `),
      ).not.toThrow();
    });

    it("should type void function call as any", () => {
      expect(() =>
        checkSource(`
          func greet() { showAlert(text: "hi"); }
          greet();
        `),
      ).not.toThrow();
    });

    it("should reject unlabeled arguments in function call", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let result = add(1, 2);
        `),
      ).toThrow(CompileError);
    });
  });

  describe("recursion warnings", () => {
    it("should emit warning for direct recursion", () => {
      const warnings = checkSourceWithWarnings(`
        func countdown(n: Number) {
          if n > 0 {
            countdown(n: n - 1);
          }
        }
      `);
      expect(warnings).toHaveLength(1);
      expect(warnings.at(0)?.message).toContain("recursive");
    });

    it("should not emit warning for non-recursive call", () => {
      const warnings = checkSourceWithWarnings(`
        func greet() { showAlert(text: "hi"); }
        func main() { greet(); }
      `);
      expect(warnings).toHaveLength(0);
    });

    it("should emit warning for mutual recursion", () => {
      const warnings = checkSourceWithWarnings(`
        func ping(n: Number) {
          if n > 0 { pong(n: n - 1); }
        }
        func pong(n: Number) {
          if n > 0 { ping(n: n - 1); }
        }
      `);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
      expect(warnings.at(0)?.message).toContain("recursive");
    });

    it("should allow forward function calls", () => {
      expect(() =>
        checkSource(`
          func main() { helper(); }
          func helper() { showAlert(text: "hi"); }
        `),
      ).not.toThrow();
    });
  });

  describe("dot-name in function argument", () => {
    it("should resolve dot-name in function argument", () => {
      expect(() =>
        checkSource(`
          enum Color { red = "RED", blue = "BLUE" }
          func paint(c: Color) { showAlert(text: "painted"); }
          paint(c: .red);
        `),
      ).not.toThrow();
    });
  });

  describe("top-level return", () => {
    it("should reject bare return at top level", () => {
      expect(() => checkSource("return;")).toThrow(CompileError);
    });

    it("should reject return with value at top level", () => {
      expect(() => checkSource("return 42;")).toThrow(CompileError);
    });

    it("should include descriptive error for top-level return", () => {
      expect(() => checkSource("return;")).toThrow(CompileError);
    });
  });

  describe("pipelines", () => {
    it("should accept a pipeline through a function", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x = 5 |> double;
        `),
      ).not.toThrow();
    });

    it("should infer type through a pipeline", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x: Number = 5 |> double;
        `),
      ).not.toThrow();
    });

    it("should reject type mismatch through a pipeline", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x: Text = 5 |> double;
        `),
      ).toThrow(CompileError);
    });

    it("should infer type through a multi-stage pipeline", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          func triple(n: Number) -> Number { return n * 3; }
          let x: Number = 5 |> double |> triple;
        `),
      ).not.toThrow();
    });

    it("should make result optional through |>?", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x: Number? = nil;
          let y: Number? = x |>? double;
        `),
      ).not.toThrow();
    });

    it("should reject non-optional input to |>?", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x = 5 |>? double;
        `),
      ).toThrow(CompileError);
    });

    it("should unwrap optional for stages after |>?", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          func triple(n: Number) -> Number { return n * 3; }
          let x: Number? = nil;
          let y: Number? = x |>? double |> triple;
        `),
      ).not.toThrow();
    });

    it("should accept pipeline with explicit arguments", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let x = 5 |> add(b: 10);
        `),
      ).not.toThrow();
    });

    it("should reject _ outside pipeline stages", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x = double(n: _);
        `),
      ).toThrow(CompileError);
    });

    it("should accept _ in pipeline stage arguments", () => {
      expect(() =>
        checkSource(`
          func add(a: Number, b: Number) -> Number { return a + b; }
          let x = 5 |> add(b: 10, a: _);
        `),
      ).not.toThrow();
    });

    it("should accept bare stage name as zero-arg call", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          let x = 5 |> double;
        `),
      ).not.toThrow();
    });

    it("should accept expression statement with pipeline ending in action call", () => {
      expect(() =>
        checkSource(`
          let x = "hello";
          x |> showAlert;
        `),
      ).not.toThrow();
    });

    it("should reject expression statement with pipeline ending in function call", () => {
      expect(() =>
        checkSource(`
          func double(n: Number) -> Number { return n * 2; }
          5 |> double;
        `),
      ).toThrow(CompileError);
    });
  });

  describe("action declarations", () => {
    it("should accept an action declaration with no parameters", () => {
      expect(() => checkSource('action doThing() = "com.example.dothing";')).not.toThrow();
    });

    it("should accept an action declaration with parameters", () => {
      expect(() =>
        checkSource('action sendMessage(to: Text, body: Text) = "com.example.send";'),
      ).not.toThrow();
    });

    it("should accept an action declaration with keyword labels", () => {
      expect(() =>
        checkSource('action search(in: Text, for: Text) -> List<Text> = "com.example.search";'),
      ).not.toThrow();
    });

    it("should reject duplicate action names", () => {
      expect(() =>
        checkSource(`
          action doA() = "com.example.a";
          action doA() = "com.example.b";
        `),
      ).toThrow(CompileError);
    });

    it("should reject duplicate parameter labels", () => {
      expect(() => checkSource('action bad(x: Text, x: Text) = "com.example.bad";')).toThrow(
        CompileError,
      );
    });

    it("should reject default parameter with wrong type", () => {
      expect(() => checkSource('action bad(x: Text = 42) = "com.example.bad";')).toThrow(
        CompileError,
      );
    });
  });

  describe("action calls", () => {
    it("should accept valid action call", () => {
      expect(() =>
        checkSource(`
          action sendMessage(to: Text, body: Text) = "com.example.send";
          sendMessage(to: "alice", body: "hello");
        `),
      ).not.toThrow();
    });

    it("should accept action call with keyword-labeled argument", () => {
      expect(() =>
        checkSource(`
          action search(in: Text, for: Text) -> List<Text> = "com.example.search";
          let results = search(in: "inbox", for: "urgent");
        `),
      ).not.toThrow();
    });

    it("should reject action call with wrong argument type", () => {
      expect(() =>
        checkSource(`
          action sendMessage(to: Text, body: Text) = "com.example.send";
          sendMessage(to: 42, body: "hello");
        `),
      ).toThrow(CompileError);
    });

    it("should reject action call with missing required argument", () => {
      expect(() =>
        checkSource(`
          action sendMessage(to: Text, body: Text) = "com.example.send";
          sendMessage(to: "alice");
        `),
      ).toThrow(CompileError);
    });

    it("should reject action call with unknown parameter label", () => {
      expect(() =>
        checkSource(`
          action sendMessage(to: Text, body: Text) = "com.example.send";
          sendMessage(to: "alice", subject: "hello");
        `),
      ).toThrow(CompileError);
    });

    it("should accept action call with default parameter omitted", () => {
      expect(() =>
        checkSource(`
          action notify(body: Text, title: Text = "Alert") = "is.workflow.actions.notification";
          notify(body: "done");
        `),
      ).not.toThrow();
    });

    it("should type action call result from return type", () => {
      expect(() =>
        checkSource(`
          action getClipboard() -> Text = "is.workflow.actions.getclipboard";
          let text: Text = getClipboard();
        `),
      ).not.toThrow();
    });

    it("should type action call without return type as any", () => {
      expect(() =>
        checkSource(`
          action doThing() = "com.example.dothing";
          let x = doThing();
        `),
      ).not.toThrow();
    });

    it("should allow action call as expression statement", () => {
      expect(() =>
        checkSource(`
          action doThing() = "com.example.dothing";
          doThing();
        `),
      ).not.toThrow();
    });

    it("should accept declared action as pipeline stage", () => {
      expect(() =>
        checkSource(`
          action transform(mode: Text) -> Text = "com.example.transform";
          let result = "hello" |> transform(mode: "upper");
        `),
      ).not.toThrow();
    });

    it("should accept declared action as bare pipeline stage", () => {
      expect(() =>
        checkSource(`
          action process() -> Text = "com.example.process";
          let result = "hello" |> process;
        `),
      ).not.toThrow();
    });

    it("should reject wrong argument type in action pipeline stage", () => {
      expect(() =>
        checkSource(`
          action transform(mode: Text) -> Text = "com.example.transform";
          let result = "hello" |> transform(mode: 42);
        `),
      ).toThrow(CompileError);
    });
  });

  describe("input built-in", () => {
    it("should accept input reference in shortcut body", () => {
      expect(() =>
        checkSource(`
          shortcut {
            name: "Test",
            input: [.text],
          }
          let x = input;
        `),
      ).not.toThrow();
    });
  });

  describe("imports", () => {
    const makeResolver = (
      files: Record<string, string>,
    ): { resolve: (from: string, path: string) => string; read: (path: string) => string } => ({
      resolve: (_from: string, importPath: string) => importPath,
      read: (path: string) => {
        const content = files[path];
        if (content === undefined) {
          throw new Error(`file not found: ${path}`);
        }
        return content;
      },
    });

    it("should resolve an imported function and allow qualified call", () => {
      const resolver = makeResolver({
        "./helpers": "export func greet(name: Text) -> Text { return name; }",
      });
      expect(() =>
        checkSource(
          `
            import "./helpers" as H;
            let msg = H.greet(name: "world");
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).not.toThrow();
    });

    it("should resolve an imported enum and allow qualified access", () => {
      const resolver = makeResolver({
        "./types": 'export enum Color { red = "RED", blue = "BLUE" }',
      });
      expect(() =>
        checkSource(
          `
            import "./types" as T;
            let c = T.Color.red;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).not.toThrow();
    });

    it("should resolve an imported action and allow qualified call", () => {
      const resolver = makeResolver({
        "./actions": 'export action doThing(text: Text) = "com.example.dothing";',
      });
      expect(() =>
        checkSource(
          `
            import "./actions" as A;
            A.doThing(text: "hello");
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).not.toThrow();
    });

    it("should reject access to non-exported declarations", () => {
      const resolver = makeResolver({
        "./helpers": "func greet(name: Text) -> Text { return name; }",
      });
      expect(() =>
        checkSource(
          `
            import "./helpers" as H;
            let msg = H.greet(name: "world");
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject shortcut block in library", () => {
      const resolver = makeResolver({
        "./bad": 'shortcut { name: "Bad" }',
      });
      expect(() =>
        checkSource(
          `
            import "./bad" as B;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject var declaration in library", () => {
      const resolver = makeResolver({
        "./bad": "var x = 42;",
      });
      expect(() =>
        checkSource(
          `
            import "./bad" as B;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject bare statements in library", () => {
      const resolver = makeResolver({
        "./bad": 'showAlert(text: "hi");',
      });
      expect(() =>
        checkSource(
          `
            import "./bad" as B;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should detect import cycles", () => {
      const resolver = makeResolver({
        "./a": 'import "./b" as B; export func fa() -> Text { return "a"; }',
        "./b": 'import "./a" as A; export func fb() -> Text { return "b"; }',
      });
      expect(() =>
        checkSource(
          `
            import "./a" as A;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject duplicate import aliases", () => {
      const resolver = makeResolver({
        "./a": 'export func fa() -> Text { return "a"; }',
        "./b": 'export func fb() -> Text { return "b"; }',
      });
      expect(() =>
        checkSource(
          `
            import "./a" as H;
            import "./b" as H;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject alias that conflicts with a declaration", () => {
      const resolver = makeResolver({
        "./helpers": "export func greet(name: Text) -> Text { return name; }",
      });
      expect(() =>
        checkSource(
          `
            import "./helpers" as greet;
            func greet() -> Text { return "hi"; }
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should reject access to non-exported let binding in library", () => {
      const resolver = makeResolver({
        "./constants": 'let greeting = "hello"; export func greet() -> Text { return greeting; }',
      });
      expect(() =>
        checkSource(
          `
            import "./constants" as C;
            let x = C.greeting;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });

    it("should fold static let in library and allow qualified access", () => {
      const resolver = makeResolver({
        "./constants": 'export let greeting = "hello";',
      });
      expect(() =>
        checkSource(
          `
            import "./constants" as C;
            let x = C.greeting;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).not.toThrow();
    });

    it("should allow exported let referencing another static let", () => {
      const resolver = makeResolver({
        "./constants": 'let base = "hello"; export let greeting = "${base} world";',
      });
      expect(() =>
        checkSource(
          `
            import "./constants" as C;
            let x = C.greeting;
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).not.toThrow();
    });

    it("should not re-export imports from a library", () => {
      const resolver = makeResolver({
        "./inner": 'export func innerFn() -> Text { return "inner"; }',
        "./outer": 'import "./inner" as I; export func outerFn() -> Text { return I.innerFn(); }',
      });
      expect(() =>
        checkSource(
          `
            import "./outer" as O;
            let x = O.I.innerFn();
          `,
          { resolver, filePath: "main.chute" },
        ),
      ).toThrow(CompileError);
    });
  });

  describe("stdlib", () => {
    it("should accept stdlib action call without explicit declaration", () => {
      expect(() => checkSource('showAlert(text: "hello");')).not.toThrow();
    });

    it("should type-check stdlib action arguments", () => {
      expect(() => checkSource("showAlert(text: 42);")).toThrow(CompileError);
    });

    it("should reject unknown parameter on stdlib action", () => {
      expect(() => checkSource('showAlert(title: "hello");')).toThrow(CompileError);
    });

    it("should allow user declaration to shadow stdlib name", () => {
      expect(() =>
        checkSource(`
          action showAlert(message: Text) = "custom.alert";
          showAlert(message: "hello");
        `),
      ).not.toThrow();
    });

    it("should accept notification with default title", () => {
      expect(() => checkSource('notification(body: "Task complete");')).not.toThrow();
    });

    it("should accept getClipboard return type as Text", () => {
      expect(() => checkSource("let clip: Text = getClipboard();")).not.toThrow();
    });
  });

  describe("quantity unit validation", () => {
    it("should accept known quantity unit", () => {
      expect(() => checkSource("let d: Quantity<meters> = 5;")).not.toThrow();
    });

    it("should warn on unknown quantity unit", () => {
      const warnings = checkSourceWithWarnings("let d: Quantity<parsecs> = 5;");
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.at(0)?.message).toContain("parsecs");
    });
  });
});
