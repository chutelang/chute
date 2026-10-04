# Link cleaner

A shortcut that takes a URL from the clipboard, strips tracking parameters, and copies the clean URL back.

## What you'll learn

- [Pipelines](/reference/pipelines) with `|>`
- [Functions](/reference/functions) declared with `func`
- [Variables and bindings](/reference/variables) for intermediate values
- [Device actions](/reference/stdlib/device), including `Device.getClipboard` and `Device.copyToClipboard`
- [Text actions](/reference/stdlib/text), including `Text.splitText`

## Source

```chute
shortcut {
  name: "Link Cleaner",
  description: "Strip tracking parameters from a URL",
}

import Device;
import Text;
import Scripting;

func cleanURL(url: Text) -> Text {
  const parts = Text.splitText(url, "?");
  return parts[0];
}

const url = Device.getClipboard();
const cleaned = url |> cleanURL;
Device.copyToClipboard(cleaned);
Scripting.showAlert("Cleaned URL copied!\n${cleaned}");
```

## How it works

The `cleanURL` function splits a URL at the `?` character and returns the part before it. The compiler converts the function call to a Run Shortcut action that targets the current shortcut.

The pipeline operator `|>` passes the clipboard URL to `cleanURL`. In this example, `url |> cleanURL` is equivalent to `cleanURL(url)`.

The shortcut writes the result to the clipboard with `Device.copyToClipboard`, then displays the cleaned URL in an interpolated alert.
