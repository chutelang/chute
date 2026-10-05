# Core concepts

This page explains how Chute language features map to Siri Shortcuts actions and data.

## Variables are magic variables

In Shortcuts, every action's output becomes a *magic variable* that later actions can reference. In Chute, you use `const` and `let` instead.

```chute
shortcut { name: "Variables" }

import Scripting;

const greeting = "Hello";
Scripting.showAlert(greeting);
```

`const` creates an immutable binding. The compiler translates it into a "Set Variable" action, and any reference to `greeting` becomes a "Get Variable" action that retrieves the stored value.

Use `let` when you need to reassign a variable:

```text
let count = 0;
count = count + 1;
```

For more details, see [Variables and bindings](/reference/variables).

## Functions

Chute functions have typed parameters and return values. The compiler includes each function in the same shortcut file. A function call becomes a "Run Shortcut" action that targets that shortcut.

```chute
shortcut { name: "Functions" }

import Scripting;

func double(n: Number) -> Number {
  return n * 2;
}

const result = double(5);
Scripting.showResult("${result}");
```

For more details, see [Functions](/reference/functions).

## Actions map to Shortcuts actions

The `action` keyword binds a Chute function name to a Shortcuts action identifier. Standard library functions such as `Scripting.showAlert` and `Device.getClipboard` use action declarations.

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

import Scripting;

const items = ["apples", "bananas", "cherries"];
for item in items {
  Scripting.showAlert(item);
}
```

The `for` loop compiles to a "Repeat with Each" action. The loop variable `item` references the "Repeat Item" magic variable that Shortcuts provides inside the loop.

For more details, see [Control flow](/reference/control-flow).

## The type system catches errors at compile time

Shortcuts doesn't check these types before running an action. An incompatible output can therefore cause a runtime error.

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

import Scripting;

const x = 5 |> double |> triple;
Scripting.showResult("${x}");
```

The value `5` flows into `double`, and the result flows into `triple`. You can also use `|>?` for optional values. If the value is `nil`, the pipeline short-circuits and the result is `nil`.

For more details, see [Pipelines](/reference/pipelines).

## Enums and records give you structured data

Chute adds enums and records for data that Shortcuts represents without custom types.

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
const sum = math.add(3, 4);
```

For more details, see [Imports & Modules](/reference/imports).

## The standard library wraps common Shortcuts actions

Chute includes 390 standard library action declarations in 17 modules. Import a module before calling its actions:

```chute
import Scripting;
import Notification;

Scripting.askForInput("What is your name?");
Notification.showAlert("Hello!");
```

The [standard library reference](/reference/stdlib/) lists every module and action. Each declaration defines its parameters, types, defaults, and Shortcuts identifier. The compiler uses that declaration to emit the action and its parameter keys.
