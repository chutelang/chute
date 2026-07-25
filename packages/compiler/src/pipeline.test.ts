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
showAlert(text: "\${c}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile record construction and field access", () => {
    const source = `shortcut {
  name: "Record",
}

record Point { x: Number, y: Number }
let p = Point(x: 10, y: 20);
let sum = p.x + p.y;
showAlert(text: "\${sum}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile let destructuring", () => {
    const source = `shortcut {
  name: "Destructure",
}

record Point { x: Number, y: Number }
let p = Point(x: 5, y: 7);
let { x, y } = p;
showAlert(text: "\${x}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum dot-name shorthand with type annotation", () => {
    const source = `shortcut {
  name: "DotName",
}

enum Direction { north, south, east, west }
let dir: Direction = .north;
showAlert(text: "\${dir}");`;

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

  it("should compile a multi-parameter function's sub-shortcut", () => {
    const source = `shortcut {
  name: "AddTwo",
}

func add(a: Number, b: Number) -> Number { return a + b; }
let x = add(a: 3, b: 4);
showResult(text: "\${x}");`;

    const result = compile(source);
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
showResult(text: "\${y}");`;

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
showResult(text: "\${x}");`;

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
showResult(text: "\${x}");`;

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

  it("should compile a single-stage pipeline", () => {
    const source = `shortcut {
  name: "Pipe",
}

func double(n: Number) -> Number { return n * 2; }
let x = 5 |> double;
showResult(text: "\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a multi-stage pipeline", () => {
    const source = `shortcut {
  name: "MultiPipe",
}

func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }
let x = 5 |> double |> triple;
showResult(text: "\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile an optional pipeline with |>?", () => {
    const source = `shortcut {
  name: "OptionalPipe",
}

func double(n: Number) -> Number { return n * 2; }
let x: Number? = nil;
let y = x |>? double;
showResult(text: "done");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline with explicit arguments", () => {
    const source = `shortcut {
  name: "PipeArgs",
}

func add(a: Number, b: Number) -> Number { return a + b; }
let x = 5 |> add(b: 10);
showResult(text: "\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline with _ placeholder", () => {
    const source = `shortcut {
  name: "PipePlaceholder",
}

func add(a: Number, b: Number) -> Number { return a + b; }
let x = 5 |> add(b: 10, a: _);
showResult(text: "\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline ending in an action call", () => {
    const source = `shortcut {
  name: "PipeAction",
}

let msg = "Hello from pipe";
msg |> showAlert;`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile |>? followed by |> stages", () => {
    const source = `shortcut {
  name: "MixedPipe",
}

func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }
let x: Number? = nil;
let y = x |>? double |> triple;
showResult(text: "done");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile action declaration and call", () => {
    const source = `shortcut {
  name: "Actions",
}

action sendMessage(to: Text, body: Text) = "com.example.send";
sendMessage(to: "alice", body: "hello");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile action with keyword parameter labels", () => {
    const source = `shortcut {
  name: "Keywords",
}

action search(in: Text, for: Text) -> List<Text> = "com.example.search";
let results = search(in: "inbox", for: "urgent");
showResult(text: "done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile action with default parameter", () => {
    const source = `shortcut {
  name: "Defaults",
}

action notify(body: Text, title: Text = "Alert") = "is.workflow.actions.notification";
notify(body: "Task complete");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile action with attributes", () => {
    const source = `shortcut {
  name: "Attributes",
}

action doThing() = "com.example.dothing" @retry(enabled: true) @platform(min: ios17);
doThing();`;

    expect(compile(source).main).toMatchSnapshot();
  });
});

describe("stdlib smoke tests", () => {
  it("should compile showAlert from stdlib", () => {
    const source = `shortcut { name: "StdlibAlert" }
showAlert(text: "Hello from stdlib!");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile notification with default title", () => {
    const source = `shortcut { name: "StdlibNotify" }
notification(body: "Task complete");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile getClipboard and setClipboard", () => {
    const source = `shortcut { name: "Clipboard" }
let text = getClipboard();
setClipboard(value: text);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile getCurrentDate", () => {
    const source = `shortcut { name: "Date" }
let now = getCurrentDate();
showResult(text: now);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile openURL", () => {
    const source = `shortcut { name: "OpenURL" }
openURL(url: "https://example.com");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile wait action", () => {
    const source = `shortcut { name: "Wait" }
wait(seconds: 5);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile settings toggle actions", () => {
    const source = `shortcut { name: "Settings" }
setWiFi(enabled: false);
setBluetooth(enabled: true);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile stdlib action in pipeline", () => {
    const source = `shortcut { name: "PipeStdlib" }
let msg = "hello";
msg |> showAlert;`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile user action shadowing stdlib", () => {
    const source = `shortcut { name: "Shadow" }
action showAlert(message: Text) = "custom.alert";
showAlert(message: "custom");`;
    expect(compile(source).main).toMatchSnapshot();
  });
});
