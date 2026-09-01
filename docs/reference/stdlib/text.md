# Text

Actions for creating, transforming, splitting, and combining text, plus speech input and output.

## `getText`

Create a text value.

```text
getText(text: Text) -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to produce. |

Returns the text value.

Shortcuts action: `is.workflow.actions.gettext`

## `changeCase`

Change the case of a text value.

```text
changeCase(text: Text, case: Text = "UPPERCASE") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to transform. |
| `case` | `Text` | `"UPPERCASE"` | The target case: `"UPPERCASE"`, `"lowercase"`, or `"Capitalize Every Word"`. |

Returns the transformed text.

Shortcuts action: `is.workflow.actions.text.changecase`

## `replaceText`

Replace occurrences of a pattern in text.

```text
replaceText(text: Text, find: Text, replace: Text) -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to search. |
| `find` | `Text` | None | The substring or pattern to find. |
| `replace` | `Text` | None | The replacement text. |

Returns the text with replacements applied.

Shortcuts action: `is.workflow.actions.text.replace`

## `splitText`

Split text into a list using a separator.

```text
splitText(text: Text, separator: Text = " ") -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to split. |
| `separator` | `Text` | `" "` | The delimiter to split on. |

Returns a list of text segments.

Shortcuts action: `is.workflow.actions.text.split`

## `combineText`

Join a list of text values into a single string.

```text
combineText(list: List<Text>, separator: Text = " ")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `List<Text>` | None | The list of text values to join. |
| `separator` | `Text` | `" "` | The delimiter to place between items. |

Shortcuts action: `is.workflow.actions.text.combine`

## `matchText`

Find matches for a regular expression pattern in text.

```text
matchText(text: Text, pattern: Text) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to search. |
| `pattern` | `Text` | None | The regular expression pattern. |

Returns a list of matches.

Shortcuts action: `is.workflow.actions.text.match`

## speak

Read text aloud using text-to-speech.

```text
speak(text: Text, rate: Number = 0)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | None | The text to speak. |
| `rate` | `Number` | `0` | The speech rate. |

Shortcuts action: `is.workflow.actions.speaktext`

## `dictateText`

Capture speech input and convert it to text.

```text
dictateText() -> Text
```

Returns the transcribed text.

Shortcuts action: `is.workflow.actions.dictatetext`
