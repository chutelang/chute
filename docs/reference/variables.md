# Variables and bindings

Chute has two kinds of variable bindings: immutable `const` and mutable `let`. Both are type-checked at compile time.

## `const` — immutable bindings

Use `const` to bind a value that won't change. This is the default and most common way to create a variable.

```text
const greeting = "Hello";
const count = 42;
const active = true;
```

Once bound, a `const` variable can't be reassigned:

```text
const x = 1;
x = 2; // compile error: cannot assign to immutable binding 'x'
```

## `let` — mutable bindings

Use `let` when you need to reassign a variable later. The new value must match the original type.

```text
let counter = 0;
counter = counter + 1; // ok

let name = "Alice";
name = 42; // compile error: type mismatch
```

## Type annotations

Both `const` and `let` support optional type annotations. If you omit the annotation, Chute infers the type from the initializer.

```text
const name: Text = "Alice";
const count: Number = 42;
const active: Boolean = true;
const items: List<Number> = [1, 2, 3];
const score: Number? = nil;
```

Type annotations are useful when:
- You want to make an optional type explicit (`Number?`)
- You want to assign a dot-name enum shorthand (`.red` instead of `Color.red`)
- You want to document the expected type for clarity

## Destructuring

You can destructure a [record](/reference/enums-records) into its fields with `const { ... } = expr`:

```text
record Point { x: Number, y: Number }
const p = Point(x: 5, y: 7);
const { x, y } = p;
// x is 5, y is 7
```

The destructured names must match the record's field names. You can destructure a subset of fields:

```text
const { x } = p; // only extract x
```

## How it maps to Shortcuts

In the Shortcuts app, most variables are implicit "magic variables" — each action's output is automatically available by name to later actions. In Chute, `const` is closest to this: you bind a name to the result of an expression (often an action call), and that name is available to everything that follows.

`let` is closer to the "Set Variable" action in Shortcuts — a named slot you can overwrite.

## Related

- [Types](/reference/types): the type system for annotations
- [Enums and records](/reference/enums-records): types that work with destructuring
- [Expressions](/reference/expressions): what you can put on the right side of `=`
