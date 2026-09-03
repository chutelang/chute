# Text

Text manipulation, formatting, regex, and speech.

```chute
import Text;
```

## `changeCase`

Changes the case of the text passed into the action to UPPERCASE, lowercase, or Title Case.

```chute
changeCase()
```

Shortcuts action: `is.workflow.actions.text.changecase`

## `combineText`

Joins the text together, inserting the separator between each join.

```chute
combineText()
```

Shortcuts action: `is.workflow.actions.text.combine`

## `correctSpelling`

Autocorrects the spelling of text passed into the action.

```chute
correctSpelling()
```

Shortcuts action: `is.workflow.actions.correctspelling`

## `detectLanguage`

Detects the language of the text provided as input.

```chute
detectLanguage(WFInput: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.detectlanguage`

## `dictateText`

Transcribes what you say aloud into text and passes the result to the next action.

```chute
dictateText(WFSpeechLanguage: Text, WFDictateTextStopListening: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSpeechLanguage` | `Text` | — |
| `WFDictateTextStopListening` | `Text` | `"After Pause"` |

Shortcuts action: `is.workflow.actions.dictatetext`

## `extractTextFromImage`

Uses OCR to extract text from an image.

```chute
extractTextFromImage(WFImage: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | `Any` | — |

Shortcuts action: `is.workflow.actions.extracttextfromimage`

## `getGroupFromMatchedText`

Gets the text that matched a particular capture group or all of the capture groups from the output of a Match Text action.

```chute
getGroupFromMatchedText()
```

Shortcuts action: `is.workflow.actions.text.match.getgroup`

## `getNameOfEmoji`

Gets the names of emoji passed into the action.

```chute
getNameOfEmoji(WFInput: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.getnameofemoji`

## `makeSpokenAudioFromText`

Creates an audio file from text, using text-to-speech.

```chute
makeSpokenAudioFromText(WFInput: Text, WFSpeakTextRate: Number, WFSpeakTextPitch: Number, WFSpeakTextLanguage: Text, WFSpeakTextVoice: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |
| `WFSpeakTextRate` | `Number` | 0.5 |
| `WFSpeakTextPitch` | `Number` | 1 |
| `WFSpeakTextLanguage` | `Text` | `"Default"` |
| `WFSpeakTextVoice` | `Text` | `"Default"` |

Shortcuts action: `is.workflow.actions.makespokenaudiofromtext`

## `matchText`

```chute
matchText()
```

Shortcuts action: `is.workflow.actions.text.match`

## `replaceText`

Replaces all occurrences of the given text with other text.

```chute
replaceText(WFReplaceTextFind: Text, WFReplaceTextReplace: Text, WFReplaceTextCaseSensitive: Boolean, WFReplaceTextRegularExpression: Boolean, WFInput: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFReplaceTextFind` | `Text` | — |
| `WFReplaceTextReplace` | `Text` | — |
| `WFReplaceTextCaseSensitive` | `Boolean` | true |
| `WFReplaceTextRegularExpression` | `Boolean` | false |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.text.replace`

## `showDefinition`

Shows the definition of the word passed into the action.

```chute
showDefinition(Word: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Word` | `Text` | — |

Shortcuts action: `is.workflow.actions.showdefinition`

## `speakText`

Speaks the inputted text aloud.

```chute
speakText(WFSpeakTextWait: Boolean, WFSpeakTextRate: Number, WFSpeakTextPitch: Number, WFSpeakTextLanguage: Text, WFSpeakTextVoice: Text, WFText: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSpeakTextWait` | `Boolean` | true |
| `WFSpeakTextRate` | `Number` | 0.5 |
| `WFSpeakTextPitch` | `Number` | 1 |
| `WFSpeakTextLanguage` | `Text` | `"Default"` |
| `WFSpeakTextVoice` | `Text` | `"Default"` |
| `WFText` | `Text` | — |

Shortcuts action: `is.workflow.actions.speaktext`

## `splitText`

Separates text passed into the action into a list.

```chute
splitText()
```

Shortcuts action: `is.workflow.actions.text.split`

## `text`

Passes the specified text to the next action.

```chute
text(WFTextActionText: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTextActionText` | `Text` | `""` |

Shortcuts action: `is.workflow.actions.gettext`

## `translateText`

Translates the text passed into the action into another language.

```chute
translateText(WFSelectedFromLanguage: Text, WFSelectedLanguage: Text, WFInputText: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSelectedFromLanguage` | `Text` | — |
| `WFSelectedLanguage` | `Text` | — |
| `WFInputText` | `Text` | — |

Shortcuts action: `is.workflow.actions.text.translate`

## `trimWhitespace`

Removes whitespace and newlines from both ends of the text passed into the action.

```chute
trimWhitespace(WFInput: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.text.trimwhitespace`
