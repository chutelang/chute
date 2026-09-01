# Core concepts

This page explains how Chute maps to Siri Shortcuts. If you already know how Shortcuts work, this is the fastest way to build a mental model of what Chute does under the hood.

## The compiler pipeline

When you run `chute build`, your source code passes through five stages:

1. **Lexer.** Splits the source text into tokens (keywords, identifiers, operators, literals).
2. **Parser.** Assembles tokens into an abstract syntax tree (AST) that represents the program's structure.
3. **Type checker.** Validates the AST, resolving types, checking function signatures, and reporting errors with diagnostic codes.
4. **Lowering.** Transforms the checked AST into an intermediate representation (IR) of Shortcuts actions.
5. **Codegen.** Serializes the IR into Apple's plist XML format, producing a `.shortcut` file.

The output is the same plist XML that the Shortcuts app writes when you export a shortcut. If signing is enabled, the file is passed through the macOS `shortcuts sign` CLI to produce a signed `.shortcut` file that can be imported directly.

## Variables are magic variables

In Shortcuts, every action's output becomes a *magic variable* that later actions can reference. In Chute, you use `const` and `let` instead.

```chute
shortcut { name: "Variables" }

const greeting = "Hello";
showAlert(text: greeting);
```

`const` creates an immutable binding. The compiler translates it into a "Set Variable" action, and any reference to `greeting` becomes a "Get Variable" action that retrieves the stored value.

Use `let` when you need to reassign a variable:

```text
let count = 0;
count = count + 1;
```

For more details, see [Variables and bindings](/reference/variables).

## Functions become sub-shortcuts

Each `func` declaration compiles to a separate shortcut file. When you call the function, Chute emits a "Run Shortcut" action that invokes the sub-shortcut.

```chute
shortcut { name: "Functions" }

func double(n: Number) -> Number {
  return n * 2;
}

const result = double(n: 5);
showResult(text: "${result}");
```

Under the hood, the compiler does three things:

1. Generates a separate plist file for the `double` function.
2. Passes parameters as a dictionary through the "Shortcut Input" variable.
3. Inside the sub-shortcut, extracts each parameter with a "Get Value for Key" action.

This gives you reusable logic without duplicating actions, something that isn't possible in the Shortcuts editor without manually managing sub-shortcuts.

For more details, see [Functions](/reference/functions).

## Actions map to Shortcuts actions

The `action` keyword declares a binding to a real Shortcuts action identifier. Every built-in function you call, `showAlert`, `ask`, `getClipboard`, is an action declaration behind the scenes.

Here's what the standard library's `showAlert` looks like internally:

```text
action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
```

This declaration tells the compiler three things:

- The Chute function name is `showAlert`.
- The parameter `text` maps to the Shortcuts parameter key `WFAlertActionTitle`.
- The underlying action identifier is `is.workflow.actions.alert`.

You can declare your own actions to call Shortcuts actions that aren't in the standard library. For more details, see [Actions](/reference/actions).

## Control flow compiles to Shortcuts blocks

Chute's control flow statements map directly to their Shortcuts equivalents:

| Chute | Shortcuts equivalent |
| --- | --- |
| `if`/`else` | If / Otherwise |
| `for item in list` | Repeat with Each |
| `repeat N` | Repeat |
| `menu "prompt"` | Choose from Menu |

```chute
shortcut { name: "ControlFlow" }

const items = ["apples", "bananas", "cherries"];
for item in items {
  showAlert(text: item);
}
```

The `for` loop compiles to a "Repeat with Each" action. The loop variable `item` references the "Repeat Item" magic variable that Shortcuts provides inside the loop.

For more details, see [Control flow](/reference/control-flow).

## The type system catches errors at compile time

Shortcuts has no type checking. If you connect an incompatible output to an action's input, you find out at runtime, or sometimes not at all.

Chute's type system catches these mistakes before the shortcut is compiled. The built-in types are:

| Type | Description |
| --- | --- |
| `Text` | A string of characters. |
| `Number` | An integer or decimal number. |
| `Boolean` | `true` or `false`. |
| `List<T>` | An ordered list where every element has type `T`. |
| `Dictionary` | A key-value dictionary. |
| `Quantity<unit>` | A measurement with a unit, such as `Quantity<seconds>`. |

Chute also supports optionals. A `Number?` can hold a number or `nil`, and the compiler enforces that you handle the `nil` case before using the value.

For more details, see [Types](/reference/types).

## Pipelines chain operations

In Shortcuts, you chain actions by connecting one action's output to the next action's input. Chute's pipeline operator (`|>`) does the same thing in code.

```chute
shortcut { name: "Pipelines" }

func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }

const x = 5 |> double |> triple;
showResult(text: "${x}");
```

The value `5` flows into `double`, and the result flows into `triple`. You can also use `|>?` for optional values. If the value is `nil`, the pipeline short-circuits and the result is `nil`.

For more details, see [Pipelines](/reference/pipelines).

## Enums and records give you structured data

Shortcuts doesn't have a concept of custom types. In Chute, you can define enums and records to organize your data.

**Enums** represent a fixed set of values. Each case can have a backing string value:

```text
enum Color { red = "RED", blue = "BLUE", green = "GREEN" }
const c: Color = .red;
```

**Records** are named groups of fields, similar to structs:

```text
record Point { x: Number, y: Number }
const p = Point(x: 10, y: 20);
```

Records compile to dictionaries in the Shortcuts output. Each field becomes a key-value pair.

For more details, see [Enums and records](/reference/enums-records).

## Imports let you split code across files

As your shortcuts grow, you can split code across multiple `.chute` files. Use `export` to make declarations available to other files, and `import` to bring them in.

```text
// In math.chute
export func add(a: Number, b: Number) -> Number {
  return a + b;
}
```

```text
// In main.chute
import "./math" as math;
const sum = math.add(a: 3, b: 4);
```

For more details, see [Imports & Modules](/reference/imports).

## The standard library wraps common Shortcuts actions

Chute ships with a standard library of action declarations covering the most common Shortcuts actions. These are organized into categories:

- [Scripting](/reference/stdlib/scripting): `showAlert`, `ask`, `getClipboard`, `wait`, and more.
- [Text](/reference/stdlib/text): `getText`, `replaceText`, `splitText`, and more.
- [Web](/reference/stdlib/web): `openURL`, `getContentsOfURL`, `searchWeb`, and more.
- [Documents](/reference/stdlib/documents): `getFile`, `saveFile`, `createFolder`, and more.
- [Calendar](/reference/stdlib/calendar): `addNewEvent`, `getUpcomingEvents`, and more.
- [Media](/reference/stdlib/media): `takePicture`, `selectPhotos`, and more.
- [Settings](/reference/stdlib/settings): `setVolume`, `setBrightness`, `setWiFi`, and more.

Each action declaration specifies the parameter names, types, defaults, and the underlying Shortcuts action identifier. When you call a standard library function, the compiler emits the correct action with the correct parameter keys. You don.t need to look up internal identifiers yourself.
