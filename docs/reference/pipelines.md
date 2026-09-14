# Pipelines

The pipeline operator `|>` chains a value through a sequence of function or action calls. Instead of nesting calls, you read the data flow left to right.

## Basic pipelines

Pass a value into a function's first parameter:

```text
func double(n: Number) -> Number { return n * 2; }
const result = 5 |> double; // equivalent to double(5)
```

### Multi-stage pipelines

Chain multiple stages. The output of each stage feeds into the next:

```text
func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }

const result = 5 |> double |> triple; // double(5) → 10, triple(10) → 30
```

### Pipelines into actions

You can pipe into a built-in action too:

```text
const msg = "Hello from pipe";
msg |> showAlert;
```

## Extra arguments

When the target function takes multiple parameters, the piped value fills the first parameter. Provide the remaining arguments in order:

```text
func add(a: Number, b: Number) -> Number { return a + b; }
const result = 5 |> add(10); // equivalent to add(5, 10)
```

## Placeholder `_`

If you want the piped value to go to a parameter other than the first, use `_` as a placeholder:

```text
func add(a: Number, b: Number) -> Number { return a + b; }
const result = 5 |> add(10, _); // a = 10, b = piped value (5)
```

`_` is only valid inside pipeline stages. Using it outside a pipeline is a compile error.

## Optional pipeline `|>?`

Use `|>?` to pipe an optional value. If the value is `nil`, the entire pipeline short-circuits to `nil`. If it has a value, the inner value is unwrapped and passed through.

```text
func double(n: Number) -> Number { return n * 2; }

const x: Number? = nil;
const y = x |>? double; // y is Number?, which is nil here
```

The input to `|>?` must be an optional type. Using `|>?` with a non-optional value is a compile error.

### Mixing `|>?` and `|>`

After an initial `|>?`, subsequent stages can use regular `|>`. The optional wrapping is preserved:

```text
func double(n: Number) -> Number { return n * 2; }
func triple(n: Number) -> Number { return n * 3; }

const x: Number? = nil;
const y = x |>? double |> triple; // y is Number?
```

## Type coercion in pipelines

Use `_ as Type` to coerce the piped value:

```text
import Scripting

let n = Scripting.ask("Enter a number") |> _ as Number;
```

## Property access in pipelines

Use `_.property` to access a property of the piped value:

```text
import Scripting

let year = Scripting.date() |> _.year;
```

This works with opaque types like `Date` and `URL`. See [Expressions](/reference/expressions) for available properties.

## How it maps to Shortcuts

Pipelines don't introduce any new Shortcuts actions. They're a syntactic convenience, `5 |> double |> triple` compiles to the same sequence of "Run Shortcut" actions as calling `triple(double(5))`. The pipeline just makes the data flow easier to read.

## Related

- [Functions](/reference/functions): defining functions to use in pipelines
- [Actions](/reference/actions): piping into built-in actions
- [Types](/reference/types): optional types and `|>?`
