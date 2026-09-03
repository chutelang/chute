import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";

describe("compile", () => {
  it("should compile hello world to a valid plist", () => {
    const source = `import Notification;
shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

Notification.showAlert(WFAlertActionTitle: "Hello from Chute!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile multiple actions", () => {
    const source = `import Notification;
shortcut {
  name: "Multi",
}

Notification.showAlert(WFAlertActionTitle: "first");
Notification.showContent(Text: "second");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile const declaration with variable use", () => {
    const source = `import Notification;
shortcut {
  name: "Variables",
}

const greeting = "Hello";
Notification.showAlert(WFAlertActionTitle: greeting);`;

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
Notification.showContent(Text: "done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile string interpolation", () => {
    const source = `import Notification;
shortcut {
  name: "Interpolation",
}

const name = "World";
Notification.showAlert(WFAlertActionTitle: "Hello \${name}!");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile nil coalescing", () => {
    const source = `import Notification;
shortcut {
  name: "Coalesce",
}

const x: Number? = nil;
const y = x ?? 42;
Notification.showContent(Text: "done");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile if/else statement", () => {
    const source = `import Notification;
shortcut {
  name: "IfElse",
}

const x = 5;
if (x > 3) {
  Notification.showAlert(WFAlertActionTitle: "big");
} else {
  Notification.showAlert(WFAlertActionTitle: "small");
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
  Notification.showAlert(WFAlertActionTitle: "item");
}`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile repeat loop", () => {
    const source = `import Notification;
shortcut {
  name: "Repeat",
}

repeat 3 {
  Notification.showAlert(WFAlertActionTitle: "again");
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
    Notification.showAlert(WFAlertActionTitle: "A");
  }
  case "Option B" {
    Notification.showAlert(WFAlertActionTitle: "B");
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
Notification.showAlert(WFAlertActionTitle: result);`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum declaration and member access", () => {
    const source = `import Notification;
shortcut {
  name: "Enum",
}

enum Color { red = "RED", blue = "BLUE" }
const c = Color.red;
Notification.showAlert(WFAlertActionTitle: "\${c}");`;

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
Notification.showAlert(WFAlertActionTitle: "\${sum}");`;

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
Notification.showAlert(WFAlertActionTitle: "\${x}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile enum dot-name shorthand with type annotation", () => {
    const source = `import Notification;
shortcut {
  name: "DotName",
}

enum Direction { north, south, east, west }
const dir: Direction = .north;
Notification.showAlert(WFAlertActionTitle: "\${dir}");`;

    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile function declaration and call", () => {
    const source = `import Notification;
shortcut {
  name: "Functions",
}

func greet(name: Text = "World") -> Text { return name; }
const msg = greet();
Notification.showAlert(WFAlertActionTitle: msg);`;

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
const x = add(a: 3, b: 4);
Notification.showContent(Text: "\${x}");`;

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
const x = add(a: 3, b: 4);
const y = double(n: x);
Notification.showContent(Text: "\${y}");`;

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
const x = abs(n: -5);
Notification.showContent(Text: "\${x}");`;

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
func quadruple(n: Number) -> Number { return double(n: double(n: n)); }
const x = quadruple(n: 3);
Notification.showContent(Text: "\${x}");`;

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
const s = makeShirt(size: "L", color: Color.red);
Notification.showAlert(WFAlertActionTitle: s.size);`;

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
Notification.showContent(Text: "\${x}");`;

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
Notification.showContent(Text: "\${x}");`;

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
Notification.showContent(Text: "done");`;

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
const x = 5 |> add(b: 10);
Notification.showContent(Text: "\${x}");`;

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
const x = 5 |> add(b: 10, a: _);
Notification.showContent(Text: "\${x}");`;

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
Notification.showContent(Text: "done");`;

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
    const source = `import Notification;
shortcut {
  name: "Keywords",
}

action search(in: Text, for: Text) -> List<Text> = "com.example.search";
const results = search(in: "inbox", for: "urgent");
Notification.showContent(Text: "done");`;

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
    const source = `import Notification;
shortcut { name: "StdlibAlert" }
Notification.showAlert(WFAlertActionTitle: "Hello from stdlib!");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile notification with default title", () => {
    const source = `import Notification;
shortcut { name: "StdlibNotify" }
Notification.showNotification(WFNotificationActionBody: "Task complete");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile getClipboard and copyToClipboard", () => {
    const source = `import Device;
shortcut { name: "Clipboard" }
const text = Device.getClipboard();
Device.copyToClipboard(WFInput: text);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile date action", () => {
    const source = `import Scripting;
import Notification;
shortcut { name: "Date" }
const now = Scripting.date();
Notification.showContent(Text: now);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile openUrls", () => {
    const source = `import Web;
shortcut { name: "OpenURL" }
Web.openUrls(WFInput: "https://example.com");`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile wait action", () => {
    const source = `import Scripting;
shortcut { name: "Wait" }
Scripting.wait(WFDelayTime: 5);`;
    expect(compile(source).main).toMatchSnapshot();
  });

  it("should compile settings toggle actions", () => {
    const source = `import Settings;
shortcut { name: "Settings" }
Settings.setWiFi(OnValue: false);
Settings.setBluetooth(OnValue: true);`;
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
showAlert(message: "custom");`;
    expect(compile(source).main).toMatchSnapshot();
  });
});
