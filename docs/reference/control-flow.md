# Control Flow

Chute's control flow statements compile directly to their Shortcuts equivalents — `if` to an If action, `for` to Repeat with Each, `repeat` to Repeat, and `menu` to Choose from Menu.

## `if` / `else if` / `else`

Test a condition and run a block:

```text
let x = 5;
if x > 3 {
  showAlert(text: "big");
}
```

Add `else` for an alternative:

```text
if x > 3 {
  showAlert(text: "big");
} else {
  showAlert(text: "small");
}
```

Chain multiple conditions with `else if`:

```text
if x > 100 {
  showAlert(text: "huge");
} else if x > 10 {
  showAlert(text: "medium");
} else {
  showAlert(text: "small");
}
```

Variables declared inside an `if` or `else` block are scoped to that block — they're not visible outside it.

### Conditions

Conditions in `if` statements support:

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | Equal to | `x == 5` |
| `!=` | Not equal to | `x != 0` |
| `>` | Greater than | `x > 3` |
| `>=` | Greater than or equal | `x >= 3` |
| `<` | Less than | `x < 10` |
| `<=` | Less than or equal | `x <= 10` |
| `contains` | Text contains substring | `name contains "Alice"` |
| `!contains` | Text doesn't contain | `name !contains "test"` |
| `hasPrefix` | Text starts with | `url hasPrefix "https"` |
| `hasSuffix` | Text ends with | `file hasSuffix ".chute"` |
| `is` | Type test | `value is Number` |
| `in` | Range test | `x in 1...10` |

Combine conditions with `and`, `or`, and `not`:

```text
if x > 0 and x < 100 {
  showAlert(text: "in range");
}

if not (x == 0) {
  showAlert(text: "nonzero");
}
```

Conditions can be grouped with parentheses:

```text
if (x > 0 and x < 10) or x == 100 {
  showAlert(text: "match");
}
```

A boolean variable can be used directly as a condition:

```text
let ready = true;
if ready {
  showAlert(text: "go!");
}
```

## `for` loops

Iterate over a list:

```text
let items = ["apple", "banana", "cherry"];
for item in items {
  showAlert(text: item);
}
```

The loop variable is typed from the list's element type and scoped to the loop body.

In Shortcuts, this compiles to a "Repeat with Each" action.

## `repeat` loops

Run a block a fixed number of times:

```text
repeat 3 {
  showAlert(text: "again!");
}
```

Use `#index` to access the current iteration index (starting from 0):

```text
repeat 5 {
  showAlert(text: "Iteration ${#index}");
}
```

In Shortcuts, this compiles to a "Repeat" action. `#index` maps to the Repeat Index magic variable.

## `menu`

Present a menu of choices to the user:

```text
menu "What would you like to do?" {
  case "Say Hello" {
    showAlert(text: "Hello!");
  }
  case "Say Goodbye" {
    showAlert(text: "Goodbye!");
  }
}
```

Each `case` has a label (the text shown to the user) and a body of statements.

In Shortcuts, this compiles to a "Choose from Menu" action with one menu item per `case`.

## `return`

Use `return` to exit a function early, optionally with a value:

```text
func abs(n: Number) -> Number {
  if n < 0 {
    return -n;
  }
  return n;
}
```

`return` is only valid inside a function body. At the top level, it's a compile error.

## Related

- [Variables & Bindings](/reference/variables) — loop variables and scoping
- [Expressions](/reference/expressions) — condition operators in detail
- [Functions](/reference/functions) — `return` statements
