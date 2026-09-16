# Text

Text manipulation, formatting, regex, and speech.

```chute
import Text;
```

## `changeCase`

Changes the case of the text passed into the action to UPPERCASE, lowercase, or Title Case.

```chute
changeCase(Any, ChangeCaseType)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFCaseType` | UPPERCASE | lowercase | Capitalize Every Word | Capitalize with Title Case | Capitalize with sentence case | aLtErNaTiNg CaSe | — |

Shortcuts action: `is.workflow.actions.text.changecase`

## `combineText`

Joins the text together, inserting the separator between each join.

```chute
combineText(Any, CombineTextSeparator, Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFTextSeparator` | New Lines | Spaces | Every Character | Custom | — |
| `WFTextCustomSeparator` | Any | — |

Shortcuts action: `is.workflow.actions.text.combine`

## `correctSpelling`

Autocorrects the spelling of text passed into the action.

```chute
correctSpelling(Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |

Shortcuts action: `is.workflow.actions.correctspelling`

## `detectLanguage`

Detects the language of the text provided as input.

```chute
detectLanguage(Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.detectlanguage`

## `dictateText`

Transcribes what you say aloud into text and passes the result to the next action.

```chute
dictateText(Text, Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSpeechLanguage` | Text | — |
| `WFDictateTextStopListening` | After Pause | After Short Pause | On Tap | `"After Pause"` |

Shortcuts action: `is.workflow.actions.dictatetext`

## `extractTextFromImage`

Uses OCR to extract text from an image.

```chute
extractTextFromImage(Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | Any | — |

Shortcuts action: `is.workflow.actions.extracttextfromimage`

## `getGroupFromMatchedText`

Gets the text that matched a particular capture group or all of the capture groups from the output of a Match Text action.

```chute
getGroupFromMatchedText(Any, MatchTextGetGroupType, Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `matches` | Any | — |
| `WFGetGroupType` | Group At Index | All Groups | — |
| `WFGroupIndex` | Number | — |

Shortcuts action: `is.workflow.actions.text.match.getgroup`

## `getNameOfEmoji`

Gets the names of emoji passed into the action.

```chute
getNameOfEmoji(Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.getnameofemoji`

## `makeSpokenAudioFromText`

Creates an audio file from text, using text-to-speech.

```chute
makeSpokenAudioFromText(Text, Number, Number, Text, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |
| `WFSpeakTextRate` | Number | 0.5 |
| `WFSpeakTextPitch` | Number | 1 |
| `WFSpeakTextLanguage` | Text | `"Default"` |
| `WFSpeakTextVoice` | Text | `"Default"` |

Shortcuts action: `is.workflow.actions.makespokenaudiofromtext`

## `matchText`

```chute
matchText(Any, Any, Boolean)
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
replaceText(Text, Text, Boolean, Boolean, Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFReplaceTextFind` | Text | — |
| `WFReplaceTextReplace` | Text | — |
| `WFReplaceTextCaseSensitive` | Boolean | true |
| `WFReplaceTextRegularExpression` | Boolean | false |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.text.replace`

## `showDefinition`

Shows the definition of the word passed into the action.

```chute
showDefinition(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Word` | Text | — |

Shortcuts action: `is.workflow.actions.showdefinition`

## `speakText`

Speaks the inputted text aloud.

```chute
speakText(Boolean, Number, Number, Text, Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSpeakTextWait` | Boolean | true |
| `WFSpeakTextRate` | Number | 0.5 |
| `WFSpeakTextPitch` | Number | 1 |
| `WFSpeakTextLanguage` | Text | `"Default"` |
| `WFSpeakTextVoice` | Text | `"Default"` |
| `WFText` | Text | — |

Shortcuts action: `is.workflow.actions.speaktext`

## `splitText`

Separates text passed into the action into a list.

```chute
splitText(Any, SplitTextSeparator, Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Any | — |
| `WFTextSeparator` | New Lines | Spaces | Every Character | Custom | — |
| `WFTextCustomSeparator` | Any | — |

Shortcuts action: `is.workflow.actions.text.split`

## `text`

Passes the specified text to the next action.

```chute
text(Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTextActionText` | Text | `""` |

Shortcuts action: `is.workflow.actions.gettext`

## `translateText`

Translates the text passed into the action into another language.

```chute
translateText(Text, Text, Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSelectedFromLanguage` | Text | — |
| `WFSelectedLanguage` | Text | — |
| `WFInputText` | Text | — |

Shortcuts action: `is.workflow.actions.text.translate`

## `trimWhitespace`

Removes whitespace and newlines from both ends of the text passed into the action.

```chute
trimWhitespace(Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.text.trimwhitespace`
