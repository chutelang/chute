# Share clipboard

A shortcut that reads your clipboard, lets you choose what to do with it, and acts on your choice.

## What you'll learn

- [Variables and bindings](/reference/variables) with `const` and `let`
- [Control flow](/reference/control-flow) with `menu`
- [String interpolation](/reference/expressions) with `${}`
- [Device actions](/reference/stdlib/device), including `Device.getClipboard` and `Device.copyToClipboard`
- [Sharing actions](/reference/stdlib/sharing), including `Sharing.share`
- [Text actions](/reference/stdlib/text), including `Text.changeCase`

## Source

```chute
shortcut {
  name: "Share Clipboard",
  description: "Read clipboard and share or transform it",
}

import Device;
import Sharing;
import Text;
import Scripting;

const text = Device.getClipboard();

menu "What do you want to do?" {
  case "Share" {
    Sharing.share(text);
  }
  case "Copy Uppercase" {
    const upper = Text.changeCase(text, "UPPERCASE");
    Device.copyToClipboard(upper);
    Scripting.showAlert("Copied to clipboard!");
  }
  case "Show" {
    Scripting.showAlert("Clipboard: ${text}");
  }
}
```

## How it works

`Device.getClipboard()` reads the clipboard into `text`. The compiler emits a "Get Clipboard" action and binds its magic-variable output to `text`.

The `menu` block provides three options:

- `Share` passes the clipboard text to the system share sheet with `Sharing.share()`.
- `Copy Uppercase` transforms the text with `Text.changeCase()`, writes it to the clipboard, and displays a confirmation.
- `Show` inserts `text` into an alert with string interpolation.
