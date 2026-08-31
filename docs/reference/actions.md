# Actions

Actions are Chute's bridge to Siri Shortcuts. Each action declaration maps a function-like call to a specific Shortcuts action identifier.

Chute ships with a [standard library](/reference/stdlib/scripting) of ~50 built-in actions covering scripting, text, web, sharing, documents, calendar, contacts, maps, media, settings, and health. You can also declare your own actions for Shortcuts actions not yet in the standard library.

## Declaring actions

An action declaration specifies:
- A callable name
- Parameters with external labels (the Shortcuts parameter key) and types
- An optional return type
- A runtime identifier (the Shortcuts action ID)

```text
action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
```

Breaking this down:

| Part | Meaning |
|------|---------|
| `showAlert` | The name you use to call this action in Chute |
| `text` | The label you use at the call site: `showAlert(text: "Hello")` |
| `WFAlertActionTitle` | The internal Shortcuts parameter key (written to the compiled plist) |
| `Text` | The parameter type |
| `"is.workflow.actions.alert"` | The Shortcuts action identifier |

### Why two names per parameter?

In the Shortcuts app, each action parameter has an internal key like `WFAlertActionTitle`. These keys aren't user-friendly, so Chute lets you define a readable label (`text`) that maps to the internal key. You write `showAlert(text: "Hello")`, and the compiler emits the correct `WFAlertActionTitle` key in the plist.

## Parameters

### Multiple parameters

Actions can have multiple parameters, each with their own label and internal key:

```text
action notify(
  body WFNotificationActionBody: Text,
  title WFNotificationActionTitle: Text
) = "is.workflow.actions.notification";
```

### Default values

Parameters can have defaults, making them optional at the call site:

```text
action notify(
  body WFNotificationActionBody: Text,
  title WFNotificationActionTitle: Text = "Alert"
) = "is.workflow.actions.notification";

notify(body: "Task complete"); // title defaults to "Alert"
```

### Return types

Some actions produce a value. Declare this with `-> Type`:

```text
action ask(prompt WFAskActionPrompt: Text) -> Text = "is.workflow.actions.ask";

let name = ask(prompt: "What's your name?");
```

Actions without a return type don't produce a usable value.

### Single-name parameters

When the label and internal key are the same, you can write the name once:

```text
action sendMessage(to: Text, body: Text) = "com.example.send";
```

## Attributes

Actions can have attributes that provide extra metadata:

```text
action doThing() = "com.example.dothing"
  @retry(enabled: true)
  @platform(min: ios17);
```

Attributes use the `@name` or `@name(key: value, ...)` syntax and appear after the runtime identifier.

## Calling actions

Call an action the same way you call a function — with labeled arguments:

```text
showAlert(text: "Hello!");
notification(body: "Done", title: "Success");
let clipboard = getClipboard();
```

Actions can also be used in [pipelines](/reference/pipelines):

```text
let msg = "Hello";
msg |> showAlert;
```

## Shadowing the standard library

If you declare an action with the same name as a standard library action, your declaration shadows it:

```text
action showAlert(message: Text) = "custom.alert";
showAlert(message: "custom"); // uses your declaration, not the stdlib
```

## Exporting actions

Use `export` to make an action available to other modules:

```text
export action fetchData(url WFURL: Text) -> Text = "is.workflow.actions.downloadurl";
```

## Related

- [Standard Library](/reference/stdlib/scripting) — built-in actions available in every Chute file
- [Functions](/reference/functions) — user-defined logic (compiles to sub-shortcuts, not Shortcuts actions)
- [Pipelines](/reference/pipelines) — chaining actions with `|>`
