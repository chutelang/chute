# Share Clipboard

A shortcut that reads your clipboard, lets you choose what to do with it, and acts on your choice.

## What you'll learn

- [Variables and bindings](/reference/variables) — storing action results with `let`
- [Control flow](/reference/control-flow) — presenting choices with `menu`
- [String interpolation](/reference/expressions) — embedding values in text with `${}`
- [Standard library actions](/reference/stdlib/scripting) — `getClipboard`, `setClipboard`, `share`, `showAlert`

## Source

```chute
shortcut {
  name: "Share Clipboard",
  description: "Read clipboard and share or transform it",
}

let text = getClipboard();

menu "What do you want to do?" {
  case "Share" {
    share(input: text);
  }
  case "Copy Uppercase" {
    let upper = changeCase(text: text, case: "UPPERCASE");
    setClipboard(value: upper);
    showAlert(text: "Copied to clipboard!");
  }
  case "Show" {
    showAlert(text: "Clipboard: ${text}");
  }
}
```

## How it works

The shortcut starts by reading the clipboard into a `text` variable with `getClipboard()`. In the Shortcuts app, this is the "Get Clipboard" action, and `text` becomes its output — the equivalent of a magic variable.

The `menu` block presents a "Choose from Menu" dialog with three options:

- **Share** passes the clipboard text to the system share sheet with `share()`.
- **Copy Uppercase** transforms the text with `changeCase()`, writes the result back to the clipboard with `setClipboard()`, and confirms with an alert.
- **Show** displays the clipboard contents in an alert, using string interpolation to embed the `text` variable.
