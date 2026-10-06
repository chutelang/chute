# Text

Text manipulation, formatting, regex, and speech.

```chute
import Text;
```

## `changeCase`

Changes the case of the text passed into the action to UPPERCASE, lowercase, or Title Case.

```chute
changeCase(text: Any, WFCaseType: ChangeCaseType) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFCaseType` | UPPERCASE \\| lowercase \\| Capitalize Every Word \\| Capitalize with Title Case \\| Capitalize with sentence case \\| aLtErNaTiNg CaSe | — |

Shortcuts action: `is.workflow.actions.text.changecase`

## `combineText`

Joins the text together, inserting the separator between each join.

```chute
combineText(text: Any, WFTextSeparator: CombineTextSeparator, WFTextCustomSeparator: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFTextSeparator` | New Lines \\| Spaces \\| Every Character \\| Custom | — |
| `WFTextCustomSeparator` | Any | — |

Shortcuts action: `is.workflow.actions.text.combine`

## `correctSpelling`

Autocorrects the spelling of text passed into the action.

```chute
correctSpelling(text: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |

Shortcuts action: `is.workflow.actions.correctspelling`

## `detectLanguage`

Detects the language of the text provided as input.

```chute
detectLanguage(text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.detectlanguage`

## `dictateText`

Transcribes what you say aloud into text and passes the result to the next action.

```chute
dictateText(language: Text, stopListening: Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `language` | Text | — |
| `stopListening` | After Pause \\| After Short Pause \\| On Tap | `"After Pause"` |

Shortcuts action: `is.workflow.actions.dictatetext`

## `extractTextFromImage`

Uses OCR to extract text from an image.

```chute
extractTextFromImage(image: Image) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.extracttextfromimage`

## `getGroupFromMatchedText`

Gets the text that matched a particular capture group or all of the capture groups from the output of a Match Text action.

```chute
getGroupFromMatchedText(matches: Any, WFGetGroupType: MatchTextGetGroupType, WFGroupIndex: Number) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `matches` | Any | — |
| `WFGetGroupType` | Group At Index \\| All Groups | — |
| `WFGroupIndex` | Number | — |

Shortcuts action: `is.workflow.actions.text.match.getgroup`

## `getNameOfEmoji`

Gets the names of emoji passed into the action.

```chute
getNameOfEmoji(text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.getnameofemoji`

## `makeSpokenAudioFromText`

Creates an audio file from text, using text-to-speech.

```chute
makeSpokenAudioFromText(text: Text, rate: Number, pitch: Number, language: Text, voice: Text) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |
| `rate` | Number | 0.5 |
| `pitch` | Number | 1 |
| `language` | Text | `"Default"` |
| `voice` | Text | `"Default"` |

Shortcuts action: `is.workflow.actions.makespokenaudiofromtext`

## `matchText`

```chute
matchText(text: Any, WFMatchTextPattern: Any, WFMatchTextCaseSensitive: Boolean) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFMatchTextPattern` | Any | — |
| `WFMatchTextCaseSensitive` | Boolean | — |

Shortcuts action: `is.workflow.actions.text.match`

## `replaceText`

Replaces all occurrences of the given text with other text.

```chute
replaceText(findText: Text, replaceWith: Text, caseSensitive: Boolean, regularExpression: Boolean, text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `findText` | Text | — |
| `replaceWith` | Text | — |
| `caseSensitive` | Boolean | true |
| `regularExpression` | Boolean | false |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.text.replace`

## `showDefinition`

Shows the definition of the word passed into the action.

```chute
showDefinition(word: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `word` | Text | — |

Shortcuts action: `is.workflow.actions.showdefinition`

## `speakText`

Speaks the inputted text aloud.

```chute
speakText(waitUntilFinished: Boolean, rate: Number, pitch: Number, language: Text, voice: Text, text: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `waitUntilFinished` | Boolean | true |
| `rate` | Number | 0.5 |
| `pitch` | Number | 1 |
| `language` | Text | `"Default"` |
| `voice` | Text | `"Default"` |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.speaktext`

## `splitText`

Separates text passed into the action into a list.

```chute
splitText(text: Any, WFTextSeparator: SplitTextSeparator, WFTextCustomSeparator: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFTextSeparator` | New Lines \\| Spaces \\| Every Character \\| Custom | — |
| `WFTextCustomSeparator` | Any | — |

Shortcuts action: `is.workflow.actions.text.split`

## `text`

Passes the specified text to the next action.

```chute
text(text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | `""` |

Shortcuts action: `is.workflow.actions.gettext`

## `translateText`

Translates the text passed into the action into another language.

```chute
translateText(language: Text, to: Text, text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `language` | Text | — |
| `to` | Text | — |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.text.translate`

## `trimWhitespace`

Removes whitespace and newlines from both ends of the text passed into the action.

```chute
trimWhitespace(text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.text.trimwhitespace`
