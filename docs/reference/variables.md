# Variables & Bindings

Chute has two kinds of variable bindings: immutable `let` and mutable `var`. Both are type-checked at compile time.

## `let` — immutable bindings

Use `let` to bind a value that won't change. This is the default and most common way to create a variable.

```text
let greeting = "Hello";
let count = 42;
let active = true;
```

Once bound, a `let` variable can't be reassigned:

```text
let x = 1;
x = 2; // compile error: cannot assign to immutable binding 'x'
```

## `var` — mutable bindings

Use `var` when you need to reassign a variable later. The new value must match the original type.

```text
var counter = 0;
counter = counter + 1; // ok

var name = "Alice";
name = 42; // compile error: type mismatch
```

## Type annotations

Both `let` and `var` support optional type annotations. If you omit the annotation, Chute infers the type from the initializer.

```text
let name: Text = "Alice";
let count: Number = 42;
let active: Boolean = true;
let items: List<Number> = [1, 2, 3];
let score: Number? = nil;
```

Type annotations are useful when:
- You want to make an optional type explicit (`Number?`)
- You want to assign a dot-name enum shorthand (`.red` instead of `Color.red`)
- You want to document the expected type for clarity

## Destructuring

You can destructure a [record](/reference/enums-records) into its fields with `let { ... } = expr`:

```text
record Point { x: Number, y: Number }
let p = Point(x: 5, y: 7);
let { x, y } = p;
// x is 5, y is 7
```

The destructured names must match the record's field names. You can destructure a subset of fields:

```text
let { x } = p; // only extract x
```

## How it maps to Shortcuts

In the Shortcuts app, most variables are implicit "magic variables" — each action's output is automatically available by name to later actions. In Chute, `let` is closest to this: you bind a name to the result of an expression (often an action call), and that name is available to everything that follows.

`var` is closer to the "Set Variable" action in Shortcuts — a named slot you can overwrite.

## Related

- [Types](/reference/types) — the type system for annotations
- [Enums & Records](/reference/enums-records) — types that work with destructuring
- [Expressions](/reference/expressions) — what you can put on the right side of `=`
