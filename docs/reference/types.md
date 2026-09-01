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
const numbers: List<Number> = [1, 2, 3];
const names: List<Text> = ["Alice", "Bob"];
const empty: List<Number> = [];
```

### `Dictionary`

A key-value collection. Keys are always strings.

```text
const person = {"name": "Alice", "age": 30};
const empty = {:};
```

Access dictionary values with dot notation or subscripts:

```text
const name = person.name;
const age = person["age"];
```

## Optional types

Append `?` to any type to make it optional, meaning it can hold either a value of that type or `nil`.

```text
const score: Number? = nil;
const name: Text? = "Alice";
```

### `nil`

The `nil` literal represents the absence of a value. You can only assign it to optional types:

```text
const x: Number? = nil;  // ok
const y: Number = nil;   // compile error
```

### Nil coalescing (`??`)

Use `??` to unwrap an optional with a fallback value:

```text
const score: Number? = nil;
const display = score ?? 0; // display is Number, not Number?
```

The left side must be optional, and the right side must match the inner type.

### Nil narrowing

Inside an `if` block that checks for `nil`, Chute narrows the type automatically:

```text
const x: Number? = nil;
if (x != nil) {
  const y = x + 1; // x is Number here, not Number?
}
```

This also works in the `else` branch of `== nil` checks.

## Quantity types

Chute has built-in quantity types for physical measurements. These map to Shortcuts measurement actions.

```text
const duration: Quantity<seconds> = 30;
const distance: Quantity<kilometers> = 5;
const temp: Quantity<celsius> = 22;
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
const name = "Alice";          // inferred as Text
const count = 42;              // inferred as Number
const items = [1, 2, 3];      // inferred as List<Number>
const result = ask(prompt: "?"); // inferred as Text (from ask's return type)
```

Type annotations are required when:
- You're declaring an optional variable with `nil` (Chute can't infer the inner type from `nil` alone)
- You're using dot-name enum shorthand (`.red` instead of `Color.red`)

## Related

- [Variables and bindings](/reference/variables): using types in declarations
- [Enums and records](/reference/enums-records): defining your own types
- [Functions](/reference/functions): typed parameters and return types
