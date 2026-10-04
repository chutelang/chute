# Actions

An action declaration maps a Chute function call to a Shortcuts action identifier.

The [standard library](/reference/stdlib/) contains 390 actions in 17 modules. You can declare other actions that the standard library doesn't include.

## Declaring actions

An action declaration specifies:
- A callable name
- Parameters with names (the Shortcuts parameter key) and types
- An optional return type
- A runtime identifier (the Shortcuts action ID)

```text
action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
```

Breaking this down:

| Part | Meaning |
|------|---------|
| `showAlert` | The name you use to call this action in Chute |
| `text` | The parameter name used for documentation and editor hints |
| `WFAlertActionTitle` | The internal Shortcuts parameter key (written to the compiled plist) |
| `Text` | The parameter type |
| `"is.workflow.actions.alert"` | The Shortcuts action identifier |

### Why two names per parameter?

In the Shortcuts app, each action parameter has an internal key like `WFAlertActionTitle`. These keys aren't user-friendly, so Chute lets you define a readable name (`text`) that maps to the internal key. The compiler emits the correct `WFAlertActionTitle` key in the plist.

## Parameters

### Multiple parameters

Actions can have multiple parameters. Each parameter has its own name and internal key:

```text
action notify(
  body WFNotificationActionBody: Text,
  title WFNotificationActionTitle: Text
) = "is.workflow.actions.notification";
```

### Default values

A default value makes a parameter optional at the call site:

```text
action notify(
  body WFNotificationActionBody: Text,
  title WFNotificationActionTitle: Text = "Alert"
) = "is.workflow.actions.notification";

notify("Task complete"); // title defaults to "Alert"
```

### Return types

Some actions produce a value. Declare this with `-> Type`:

```text
action ask(prompt WFAskActionPrompt: Text) -> Text = "is.workflow.actions.ask";

const name = ask("What's your name?");
```

Actions without a return type don't produce a usable value.

### Single-name parameters

When the parameter name and internal key are the same, you can write the name once:

```text
action sendMessage(to: Text, body: Text) = "com.example.send";
```

## Attributes

Attributes attach metadata to an action declaration:

```text
action doThing() = "com.example.dothing"
  @retry(enabled: true)
  @platform(min: ios17);
```

Attributes use the `@name` or `@name(key: value, ...)` syntax and appear after the runtime identifier.

## Calling actions

Call an action the same way you call a function. Arguments are positional, matched by parameter order:

```text
showAlert("Hello!");
notification("Done", "Success");
const clipboard = getClipboard();
```

Actions can also be used in [pipelines](/reference/pipelines):

```text
const msg = "Hello";
msg |> showAlert;
```

## Shadowing the standard library

If you declare an action with the same name as a standard library action, your declaration shadows it:

```text
action showAlert(message: Text) = "custom.alert";
showAlert("custom"); // uses your declaration, not the stdlib
```

## Exporting actions

Use `export` to make an action available to other modules:

```text
export action fetchData(url WFURL: Text) -> Text = "is.workflow.actions.downloadurl";
```

## Related

- [Standard library](/reference/stdlib/scripting) lists built-in actions.
- [Functions](/reference/functions) describes user-defined logic with typed parameters and return values.
- [Pipelines](/reference/pipelines) explains how to chain actions with `|>`.
