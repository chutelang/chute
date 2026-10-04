# Functions

Functions define reusable logic with typed parameters and return values. The compiler converts each call to a "Run Shortcut" action that targets the current shortcut.

## Declaring a function

Use `func` followed by the name, parameters, an optional return type, and a body:

```text
func greet(name: Text) {
  showAlert("Hello, ${name}!");
}
```

### Parameters

Each parameter has a name and a type:

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

const msg = greet();       // uses default: "World"
const msg2 = greet("Jo");  // overrides default
```

The default value must match the parameter's type.

### Return types

Specify a return type with `-> Type` after the parameter list:

```text
func double(n: Number) -> Number {
  return n * 2;
}
```

If a function declares a return type, every `return` statement must provide a value of that type. A function without a return type can use an empty `return` or reach the end of its body.

## Calling functions

Arguments are positional. They match parameters by the order they appear in the function signature:

```text
const sum = add(3, 4);
```

## Function composition

Functions can call other functions, including functions declared later in the file. Chute resolves all function names before checking bodies, so declaration order doesn't matter.

```text
func double(n: Number) -> Number { return n * 2; }
func quadruple(n: Number) -> Number { return double(double(n)); }
```

## Recursion

The compiler warns about recursive and mutually recursive functions. Siri Shortcuts limits the call stack, so deep recursion may fail at runtime.

```text
func countdown(n: Number) {
  if (n > 0) {
    showAlert("${n}");
    countdown(n - 1); // warning: recursive call detected
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

Functions compile into the same shortcut file. The compiler adds dispatch logic at the top of the shortcut, and each function call compiles to a "Run Shortcut" action that calls the shortcut itself (`isSelf: true`) with a dispatch parameter. Arguments are passed as a dictionary through the shortcut input, and extracted with "Get Value for Key" actions inside the function body.

## Related

- [Pipelines](/reference/pipelines) explains how to chain function calls with `|>`.
- [Actions](/reference/actions) describes declarations that map directly to Shortcuts actions.
- [Variables and bindings](/reference/variables) explains how to bind function results to names.
