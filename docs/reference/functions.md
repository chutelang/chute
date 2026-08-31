# Functions

Functions let you define reusable logic. Each function compiles to its own sub-shortcut, and calling the function compiles to a "Run Shortcut" action.

## Declaring a function

Use `func` followed by the name, parameters, an optional return type, and a body:

```text
func greet(name: Text) {
  showAlert(text: "Hello, ${name}!");
}
```

### Parameters

Parameters are always labeled. Each parameter has a name and a type:

```text
func add(a: Number, b: Number) -> Number {
  return a + b;
}
```

### Default values

Parameters can have default values. Callers can omit these arguments:

```text
func greet(name: Text = "World") -> Text {
  return name;
}

let msg = greet();            // uses default: "World"
let msg2 = greet(name: "Jo"); // overrides default
```

The default value must match the parameter's type.

### Return types

Specify a return type with `-> Type` after the parameter list:

```text
func double(n: Number) -> Number {
  return n * 2;
}
```

If a function has a return type, every `return` statement must include a value of that type. If no return type is specified, the function doesn't return a value (and `return` without a value or simply reaching the end of the body are both valid).

## Calling functions

All arguments must be labeled:

```text
let sum = add(a: 3, b: 4);
```

Unlabeled arguments are a compile error:

```text
let sum = add(3, 4); // compile error: arguments must be labeled
```

## Function composition

Functions can call other functions, including functions declared later in the file. Chute resolves all function names before checking bodies, so declaration order doesn't matter.

```text
func double(n: Number) -> Number { return n * 2; }
func quadruple(n: Number) -> Number { return double(n: double(n: n)); }
```

## Recursion

Chute supports recursive and mutually recursive functions, but emits a warning. Siri Shortcuts has a limited call stack, so deep recursion may fail at runtime.

```text
func countdown(n: Number) {
  if n > 0 {
    showAlert(text: "${n}");
    countdown(n: n - 1); // warning: recursive call detected
  }
}
```

## Exporting functions

Use `export` to make a function available to other modules:

```text
export func formatName(first: Text, last: Text) -> Text {
  return "${first} ${last}";
}
```

See [Imports & Modules](/reference/imports) for how to use exported functions.

## How it maps to Shortcuts

Each `func` declaration compiles to a separate `.shortcut` file (a sub-shortcut). Calling the function compiles to a "Run Shortcut" action that invokes the sub-shortcut and passes arguments through the shortcut input.

This means your functions are real, self-contained shortcuts that can be tested and debugged independently in the Shortcuts app.

## Related

- [Pipelines](/reference/pipelines) — chain function calls with `|>`
- [Actions](/reference/actions) — built-in Shortcuts actions (similar to functions but map directly to Shortcuts actions)
- [Variables & Bindings](/reference/variables) — binding function results to names
