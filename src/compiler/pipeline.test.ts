import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";

describe("compile", () => {
  it("should compile hello world to a valid plist", () => {
    const source = `shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

showAlert(text: "Hello from Chute!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile multiple actions", () => {
    const source = `shortcut {
  name: "Multi",
}

showAlert(text: "first");
showResult(text: "second");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile let declaration with variable use", () => {
    const source = `shortcut {
  name: "Variables",
}

let greeting = "Hello";
showAlert(text: greeting);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile arithmetic expression", () => {
    const source = `shortcut {
  name: "Math",
}

let a = 10;
let b = 20;
let c = a + b;
showResult(text: "done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile string interpolation", () => {
    const source = `shortcut {
  name: "Interpolation",
}

let name = "World";
showAlert(text: "Hello \${name}!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile nil coalescing", () => {
    const source = `shortcut {
  name: "Coalesce",
}

let x: Number? = nil;
let y = x ?? 42;
showResult(text: "done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile if/else statement", () => {
    const source = `shortcut {
  name: "IfElse",
}

let x = 5;
if x > 3 {
  showAlert(text: "big");
} else {
  showAlert(text: "small");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile for loop", () => {
    const source = `shortcut {
  name: "ForLoop",
}

let items = [1, 2, 3];
for item in items {
  showAlert(text: "item");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile repeat loop", () => {
    const source = `shortcut {
  name: "Repeat",
}

repeat 3 {
  showAlert(text: "again");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile menu statement", () => {
    const source = `shortcut {
  name: "Menu",
}

menu "Choose one" {
  case "Option A" {
    showAlert(text: "A");
  }
  case "Option B" {
    showAlert(text: "B");
  }
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile ternary expression", () => {
    const source = `shortcut {
  name: "Ternary",
}

let x = 5;
let result = x > 3 ? "big" : "small";
showAlert(text: result);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum declaration and member access", () => {
    const source = `shortcut {
  name: "Enum",
}

enum Color { red = "RED", blue = "BLUE" }
let c = Color.red;
showAlert(text: c);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile record construction and field access", () => {
    const source = `shortcut {
  name: "Record",
}

record Point { x: Number, y: Number }
let p = Point(x: 10, y: 20);
let sum = p.x + p.y;
showAlert(text: sum);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile let destructuring", () => {
    const source = `shortcut {
  name: "Destructure",
}

record Point { x: Number, y: Number }
let p = Point(x: 5, y: 7);
let { x, y } = p;
showAlert(text: x);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum dot-name shorthand with type annotation", () => {
    const source = `shortcut {
  name: "DotName",
}

enum Direction { north, south, east, west }
let dir: Direction = .north;
showAlert(text: dir);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile function declaration and call", () => {
    const source = `shortcut {
  name: "Functions",
}

func greet(name: Text = "World") -> Text { return name; }
let msg = greet();
showAlert(text: msg);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
    expect(result.subShortcuts.at(0)?.plist).toMatchSnapshot();
  });

  it("should compile multiple functions", () => {
    const source = `shortcut {
  name: "MultiFunctions",
}

func add(a: Number, b: Number) -> Number { return a + b; }
func double(n: Number) -> Number { return n * 2; }
let x = add(a: 3, b: 4);
let y = double(n: x);
showResult(text: y);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile function with conditional return", () => {
    const source = `shortcut {
  name: "Conditional",
}

func abs(n: Number) -> Number {
  if n < 0 {
    return -n;
  }
  return n;
}
let x = abs(n: -5);
showResult(text: x);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
    expect(result.subShortcuts.at(0)?.plist).toMatchSnapshot();
  });

  it("should compile function calling another function", () => {
    const source = `shortcut {
  name: "Compose",
}

func double(n: Number) -> Number { return n * 2; }
func quadruple(n: Number) -> Number { return double(n: double(n: n)); }
let x = quadruple(n: 3);
showResult(text: x);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile function using enums and records", () => {
    const source = `shortcut {
  name: "TypedFunc",
}

enum Color { red = "RED", blue = "BLUE" }
record Shirt { size: Text, color: Color }
func makeShirt(size: Text, color: Color) -> Shirt {
  return Shirt(size: size, color: color);
}
let s = makeShirt(size: "L", color: Color.red);
showAlert(text: s.size);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });
});
