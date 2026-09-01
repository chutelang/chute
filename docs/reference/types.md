# Types

Chute is strongly typed. Every variable, parameter, and return value has a type that's checked at compile time. If the types don't match, you get an error before your shortcut is ever built.

## Primitive types

| Type | Description | Examples |
|------|-------------|----------|
| `Text` | A string of characters | `"Hello"`, `"${name}"` |
| `Number` | An integer or decimal number | `42`, `3.14`, `-7` |
| `Boolean` | A true or false value | `true`, `false` |

## Collection types

### `List<T>`

An ordered collection of values of type `T`.

```text
let numbers: List<Number> = [1, 2, 3];
let names: List<Text> = ["Alice", "Bob"];
let empty: List<Number> = [];
```

### `Dictionary`

A key-value collection. Keys are always strings.

```text
let person = {"name": "Alice", "age": 30};
let empty = {:};
```

Access dictionary values with dot notation or subscripts:

```text
let name = person.name;
let age = person["age"];
```

## Optional types

Append `?` to any type to make it optional, meaning it can hold either a value of that type or `nil`.

```text
let score: Number? = nil;
let name: Text? = "Alice";
```

### `nil`

The `nil` literal represents the absence of a value. You can only assign it to optional types:

```text
let x: Number? = nil;  // ok
let y: Number = nil;   // compile error
```

### Nil coalescing (`??`)

Use `??` to unwrap an optional with a fallback value:

```text
let score: Number? = nil;
let display = score ?? 0; // display is Number, not Number?
```

The left side must be optional, and the right side must match the inner type.

### Nil narrowing

Inside an `if` block that checks for `nil`, Chute narrows the type automatically:

```text
let x: Number? = nil;
if x != nil {
  let y = x + 1; // x is Number here, not Number?
}
```

This also works in the `else` branch of `== nil` checks.

## Quantity types

Chute has built-in quantity types for physical measurements. These map to Shortcuts measurement actions.

```text
let duration: Quantity<seconds> = 30;
let distance: Quantity<kilometers> = 5;
let temp: Quantity<celsius> = 22;
```

### Supported units

| Category | Units |
|----------|-------|
| Time | `seconds`, `minutes`, `hours`, `days`, `weeks` |
| Length | `meters`, `kilometers`, `miles`, `feet`, `inches`, `yards` |
| Mass | `grams`, `kilograms`, `milligrams`, `ounces`, `pounds` |
| Volume | `liters`, `milliliters`, `gallons`, `cups`, `pints`, `quarts` |
| Temperature | `celsius`, `fahrenheit`, `kelvin` |
| Angle | `degrees` |

## Type inference

You don't always need to write type annotations. Chute infers the type from the value or expression:

```text
let name = "Alice";          // inferred as Text
let count = 42;              // inferred as Number
let items = [1, 2, 3];      // inferred as List<Number>
let result = ask(prompt: "?"); // inferred as Text (from ask's return type)
```

Type annotations are required when:
- You're declaring an optional variable with `nil` (Chute can't infer the inner type from `nil` alone)
- You're using dot-name enum shorthand (`.red` instead of `Color.red`)

## Related

- [Variables and bindings](/reference/variables): using types in declarations
- [Enums and records](/reference/enums-records): defining your own types
- [Functions](/reference/functions): typed parameters and return types
