# Expressions

This page covers Chute's expression syntax, everything you can write on the right side of an `=`, pass as an argument, or use in a pipeline.

## Arithmetic

Standard arithmetic operators work on `Number` values:

| Operator | Meaning |
|----------|---------|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `%` | Modulo (remainder) |

```text
let sum = a + b;
let product = width * height;
let remainder = 10 % 3;
```

Unary negation:

```text
let negative = -x;
```

Arithmetic on non-number types is a compile error.

## String interpolation

Embed expressions inside a string with `${}`:

```text
let name = "World";
let greeting = "Hello, ${name}!";
let math = "2 + 2 = ${2 + 2}";
```

Interpolated strings are always typed as `Text`.

## Raw strings

Use `#"..."#` for strings without escape processing:

```text
let pattern = #"no \n escapes here"#;
```

## Literals

### List literals

```text
let numbers = [1, 2, 3];
let names = ["Alice", "Bob"];
let empty = [];
```

### Dictionary literals

```text
let person = {"name": "Alice", "age": 30};
let empty = {:};
```

The empty dictionary uses `{:}` to distinguish it from an empty block.

### Boolean literals

```text
let yes = true;
let no = false;
```

### Nil literal

```text
let nothing: Number? = nil;
```

See [Types](/reference/types) for optional types and nil coalescing.

## Member access

Access fields on records and dictionaries with dot notation:

```text
let name = person.name;
let x = point.x;
```

## Optional chaining

Use `?.` to safely access a member of an optional value. If the value is `nil`, the result is `nil` instead of an error:

```text
let name = maybePerson?.name; // Text?, nil if maybePerson is nil
```

Optional chaining is only valid on optional types. Using `?.` on a non-optional is a compile error.

## Subscript access

Access list elements or dictionary values by index or key:

```text
let first = items[0];
let value = dict["key"];
```

## Ternary expression

A compact conditional expression:

```text
let label = x > 0 ? "positive" : "non-positive";
```

The condition uses the same syntax as `if` conditions (see [Control flow](/reference/control-flow)). Both branches must produce the same type.

## Conditions

Conditions are a separate category from value expressions. They appear in `if` statements, `else if`, and ternary expressions, but not as standalone values.

### Comparison operators

| Operator | Meaning |
|----------|---------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |

### String operators

| Operator | Meaning |
|----------|---------|
| `contains` | Text contains substring |
| `!contains` | Text doesn't contain substring |
| `hasPrefix` | Text starts with |
| `hasSuffix` | Text ends with |

```text
if name contains "Alice" { ... }
if url hasPrefix "https" { ... }
```

### Logical operators

| Operator | Meaning |
|----------|---------|
| `and` | Both conditions must be true |
| `or` | Either condition can be true |
| `not` | Negates a condition |

```text
if x > 0 and x < 100 { ... }
if a or b { ... }
if not done { ... }
```

### Type tests

Use `is` to test a value's type at runtime:

```text
if value is Number { ... }
```

### Range tests

Use `in` with `...` to test if a value falls within a range:

```text
if x in 1...10 { ... }
```

### Grouping

Use parentheses to control evaluation order:

```text
if (x > 0 and x < 10) or x == 100 { ... }
```

## Dot-name shorthand

When the expected type is an enum, you can use `.caseName` instead of `EnumName.caseName`:

```text
let dir: Direction = .north;
```

See [Enums and records](/reference/enums-records) for details.

## `#index`

Inside a `repeat` loop, `#index` evaluates to the current iteration index (starting from 0). It's typed as `Number`.

```text
repeat 3 {
  showAlert(text: "Iteration ${#index}");
}
```

`#index` is only valid inside `repeat` blocks and `for` loop bodies.

## Comments

```text
// This is a line comment

/* This is a
   block comment */
```

Comments are ignored by the compiler and don't appear in the compiled output.

## Related

- [Variables and bindings](/reference/variables): using expressions in declarations
- [Control flow](/reference/control-flow): conditions in `if` and `for`
- [Pipelines](/reference/pipelines): chaining expressions with `|>`
- [Types](/reference/types): optional chaining, nil coalescing
