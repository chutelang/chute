import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";

describe("compile", () => {
  it("should compile hello world to a valid plist", () => {
    const source = `import Notification;
shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

Notification.showAlert("Hello from Chute!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile multiple actions", () => {
    const source = `import Notification;
shortcut {
  name: "Multi",
}

Notification.showAlert("first");
Notification.showContent("second");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile const declaration with variable use", () => {
    const source = `import Notification;
shortcut {
  name: "Variables",
}

const greeting = "Hello";
Notification.showAlert(greeting);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile arithmetic expression", () => {
    const source = `import Notification;
shortcut {
  name: "Math",
}

const a = 10;
const b = 20;
const c = a + b;
Notification.showContent("done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile string interpolation", () => {
    const source = `import Notification;
shortcut {
  name: "Interpolation",
}

const name = "World";
Notification.showAlert("Hello \${name}!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile nil coalescing", () => {
    const source = `import Notification;
shortcut {
  name: "Coalesce",
}

const x: Number? = nil;
const y = x ?? 42;
Notification.showContent("done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile if/else statement", () => {
    const source = `import Notification;
shortcut {
  name: "IfElse",
}

const x = 5;
if (x > 3) {
  Notification.showAlert("big");
} else {
  Notification.showAlert("small");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile for loop", () => {
    const source = `import Notification;
shortcut {
  name: "ForLoop",
}

const items = [1, 2, 3];
for item in items {
  Notification.showAlert("item");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile repeat loop", () => {
    const source = `import Notification;
shortcut {
  name: "Repeat",
}

repeat 3 {
  Notification.showAlert("again");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile menu statement", () => {
    const source = `import Notification;
shortcut {
  name: "Menu",
}

menu "Choose one" {
  case "Option A" {
    Notification.showAlert("A");
  }
  case "Option B" {
    Notification.showAlert("B");
  }
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile ternary expression", () => {
    const source = `import Notification;
shortcut {
  name: "Ternary",
}

const x = 5;
const result = x > 3 ? "big" : "small";
Notification.showAlert(result);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum declaration and member access", () => {
    const source = `import Notification;
shortcut {
  name: "Enum",
}

enum Color { red = "RED", blue = "BLUE" }
const c = Color.red;
Notification.showAlert("\${c}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile record construction and field access", () => {
    const source = `import Notification;
shortcut {
  name: "Record",
}

record Point { x: Number, y: Number }
const p = Point(x: 10, y: 20);
const sum = p.x + p.y;
Notification.showAlert("\${sum}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile const destructuring", () => {
    const source = `import Notification;
shortcut {
  name: "Destructure",
}

record Point { x: Number, y: Number }
const p = Point(x: 5, y: 7);
const { x, y } = p;
Notification.showAlert("\${x}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum dot-name shorthand with type annotation", () => {
    const source = `import Notification;
shortcut {
  name: "DotName",
}

enum Direction { north, south, east, west }
const dir: Direction = .north;
Notification.showAlert("\${dir}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile function declaration and call", () => {
    const source = `import Notification;
shortcut {
  name: "Functions",
}

func greet(name: Text = "World") -> Text { return name; }
const msg = greet();
Notification.showAlert(msg);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
    expect(result.subShortcuts.at(0)?.plist).toMatchSnapshot();
  });

  it("should compile a multi-parameter function's sub-shortcut", () => {
    const source = `import Notification;
shortcut {
  name: "AddTwo",
}

func add(a: Number, b: Number) -> Number { return a + b; }
const x = add(3, 4);
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.subShortcuts).toHaveLength(1);
    expect(result.subShortcuts.at(0)?.plist).toMatchSnapshot();
  });

  it("should compile multiple functions", () => {
    const source = `import Notification;
shortcut {
  name: "MultiFunctions",
}

func add(a: Number, b: Number) -> Number { return a + b; }
func double(n: Number) -> Number { return n * 2; }
const x = add(3, 4);
const y = double(x);
Notification.showContent("\${y}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile function with conditional return", () => {
    const source = `import Notification;
shortcut {
  name: "Conditional",
}

func abs(n: Number) -> Number {
  if (n < 0) {
    return -n;
  }
  return n;
}
const x = abs(-5);
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
    expect(result.subShortcuts.at(0)?.plist).toMatchSnapshot();
  });

  it("should compile function calling another function", () => {
    const source = `import Notification;
shortcut {
  name: "Compose",
}

func double(n: Number) -> Number { return n * 2; }
func quadruple(n: Number) -> Number { return double(double(n)); }
const x = quadruple(3);
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile function using enums and records", () => {
    const source = `import Notification;
shortcut {
  name: "TypedFunc",
}

enum Color { red = "RED", blue = "BLUE" }
record Shirt { size: Text, color: Color }
func makeShirt(size: Text, color: Color) -> Shirt {
  return Shirt(size: size, color: color);
}
const s = makeShirt("L", Color.red);
Notification.showAlert(s.size);`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a single-stage pipeline", () => {
    const source = `import Notification;
shortcut {
  name: "Pipe",
}

func double(n: Number) -> Number { return n * 2; }
const x = 5 |> double;
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a multi-stage pipeline", () => {
    const source = `import Notification;
shortcut {
  name: "MultiPipe",
}

func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }
const x = 5 |> double |> triple;
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile an optional pipeline with |>?", () => {
    const source = `import Notification;
shortcut {
  name: "OptionalPipe",
}

func double(n: Number) -> Number { return n * 2; }
const x: Number? = nil;
const y = x |>? double;
Notification.showContent("done");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline with explicit arguments", () => {
    const source = `import Notification;
shortcut {
  name: "PipeArgs",
}

func add(a: Number, b: Number) -> Number { return a + b; }
const x = 5 |> add(10);
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline with _ placeholder", () => {
    const source = `import Notification;
shortcut {
  name: "PipePlaceholder",
}

func add(a: Number, b: Number) -> Number { return a + b; }
const x = 5 |> add(_, 10);
Notification.showContent("\${x}");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(1);
  });

  it("should compile a pipeline ending in an action call", () => {
    const source = `import Notification;
shortcut {
  name: "PipeAction",
}

const msg = "Hello from pipe";
msg |> Notification.showAlert;`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile |>? followed by |> stages", () => {
    const source = `import Notification;
shortcut {
  name: "MixedPipe",
}

func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }
const x: Number? = nil;
const y = x |>? double |> triple;
Notification.showContent("done");`;

    const result = compile(source);
    expect(result.main).toMatchSnapshot();
    expect(result.subShortcuts).toHaveLength(2);
  });

  it("should compile action declaration and call", () => {
    const source = `shortcut {
  name: "Actions",
}

action sendMessage(to: Text, body: Text) = "com.example.send";
sendMessage("alice", "hello");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile action with keyword parameter labels", () => {
    const source = `import Notification;
shortcut {
  name: "Keywords",
}

action search(in: Text, for: Text) -> List<Text> = "com.example.search";
const results = search("inbox", "urgent");
Notification.showContent("done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile action with default parameter", () => {
    const source = `shortcut {
  name: "Defaults",
}

action notify(body: Text, title: Text = "Alert") = "is.workflow.actions.notification";
notify("Task complete");`;

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
    const source = `import Notification;
shortcut { name: "StdlibAlert" }
Notification.showAlert("Hello from stdlib!");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile notification with default title", () => {
    const source = `import Notification;
shortcut { name: "StdlibNotify" }
Notification.showNotification("Task complete");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile getClipboard and copyToClipboard", () => {
    const source = `import Device;
shortcut { name: "Clipboard" }
const text = Device.getClipboard();
Device.copyToClipboard(text);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile date action", () => {
    const source = `import Scripting;
import Notification;
shortcut { name: "Date" }
const now: Date = Scripting.date();
Notification.showAlert("Reminder");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile openUrls", () => {
    const source = `import Web;
shortcut { name: "OpenURL" }
Web.openUrls("https://example.com");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile wait action", () => {
    const source = `import Scripting;
shortcut { name: "Wait" }
Scripting.wait(5);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile settings toggle actions", () => {
    const source = `import Settings;
shortcut { name: "Settings" }
Settings.setWiFi(.turnOff, false);
Settings.setBluetooth(.turnOn, true);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile stdlib action in pipeline", () => {
    const source = `import Notification;
shortcut { name: "PipeStdlib" }
const msg = "hello";
msg |> Notification.showAlert;`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile user action shadowing stdlib", () => {
    const source = `shortcut { name: "Shadow" }
action showAlert(message: Text) = "custom.alert";
showAlert("custom");`;
    expect(compile(source).main).toMatchSnapshot();
  });
});

// A variable reference is serialized differently per parameter slot. Getting
// this wrong binds nothing and the action silently runs on empty input, which
// no type check catches -- so assert both shapes directly rather than relying
// only on the plist snapshots.
describe("variable reference slot encoding", () => {
  function paramBlock(plist: string, key: string): string {
    const start = plist.indexOf(`<key>${key}</key>`);
    expect(start).toBeGreaterThan(-1);
    return plist.slice(start, start + 600);
  }

  it("should encode a variable-picker slot as a bare attachment", () => {
    const source = `import Notification;
shortcut { name: "Test" }
const x: Text = "hi";
Notification.showAlert("\${x}");
const y = x;`;
    const block = paramBlock(compile(source).main, "WFVariable");
    expect(block).toContain("<string>WFTextTokenAttachment</string>");
    expect(block).toContain("<key>VariableName</key>");
    // The attachment is the Value itself, not a token string wrapping one.
    expect(block).not.toContain("attachmentsByRange");
  });

  it("should encode a text-field slot as a token string", () => {
    const source = `import Text;
shortcut { name: "Test" }
const raw: Text = "  padded  ";
const trimmed = Text.trimWhitespace(raw);`;
    const block = paramBlock(compile(source).main, "WFInput");
    expect(block).toContain("<string>WFTextTokenString</string>");
    expect(block).toContain("attachmentsByRange");
  });
});
