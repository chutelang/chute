# link cleaner

A shortcut that takes a URL from the clipboard, strips tracking parameters, and copies the clean URL back.

## What you'll learn

- [Pipelines](/reference/pipelines): chaining operations with `|>`
- [Functions](/reference/functions): defining reusable logic with `func`
- [Variables and bindings](/reference/variables): working with intermediate values
- [Standard library actions](/reference/stdlib/scripting): `getClipboard`, `setClipboard`
- [Standard library actions](/reference/stdlib/text): `splitText`, `replaceText`

## Source

```chute
shortcut {
  name: "Link Cleaner",
  description: "Strip tracking parameters from a URL",
}

func cleanURL(url: Text) -> Text {
  const parts = splitText(text: url, separator: "?");
  return parts[0];
}

const url = getClipboard();
const cleaned = url |> cleanURL;
setClipboard(value: cleaned);
showAlert(text: "Cleaned URL copied!\n${cleaned}");
```

## How it works

The shortcut defines a `cleanURL` function that splits a URL on the `?` character and returns the part before it. This part is the base URL without any query string. In Chute, functions compile to separate sub-shortcuts that the main shortcut calls with "Run Shortcut."

The pipeline operator `|>` passes the clipboard URL into `cleanURL`. Writing `url |> cleanURL` is equivalent to `cleanURL(url: url)`, but the pipeline form reads left-to-right, which makes chains of transformations easier to follow.

After cleaning, the shortcut writes the result back to the clipboard with `setClipboard` and confirms with an alert that includes the cleaned URL via string interpolation.
