# Web

Actions for opening URLs, fetching web content, searching the web, and extracting links.

## openURL

Open a URL in the default browser.

```text
openURL(url: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `Text` | — | The URL to open. |

Shortcuts action: `is.workflow.actions.openurl`

## getContentsOfURL

Fetch the contents of a URL.

```text
getContentsOfURL(url: Text, method: Text = "GET") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `Text` | — | The URL to fetch. |
| `method` | `Text` | `"GET"` | The HTTP method to use, for example `"POST"`. |

Returns the response body as text.

Shortcuts action: `is.workflow.actions.downloadurl`

## searchWeb

Search the web with a query.

```text
searchWeb(query: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `query` | `Text` | — | The search query. |

Shortcuts action: `is.workflow.actions.searchweb`

## showWebPage

Display a web page inline.

```text
showWebPage(url: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `Text` | — | The URL of the page to display. |

Shortcuts action: `is.workflow.actions.showwebpage`

## expandURL

Expand a shortened URL to its full form.

```text
expandURL(url: Text) -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `Text` | — | The shortened URL to expand. |

Returns the expanded URL.

Shortcuts action: `is.workflow.actions.url.expand`

## getURLsFromInput

Extract URLs from a text value.

```text
getURLsFromInput(input: Text) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The text to scan for URLs. |

Returns a list of detected URLs.

Shortcuts action: `is.workflow.actions.detect.link`
