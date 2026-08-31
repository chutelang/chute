# Scripting

Actions for alerts, input, clipboard, device info, encoding, and general shortcut control.

## showAlert

Display an alert dialog with a message.

```text
showAlert(text: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | — | The message to display in the alert. |

Shortcuts action: `is.workflow.actions.alert`

## showResult

Display a result to the user.

```text
showResult(text: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | — | The text to show. |

Shortcuts action: `is.workflow.actions.showresult`

## notification

Send a local notification.

```text
notification(body: Text, title: Text = "Notification")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `body` | `Text` | — | The notification body text. |
| `title` | `Text` | `"Notification"` | The notification title. |

Shortcuts action: `is.workflow.actions.notification`

## nothing

Produce no output. Useful as a placeholder or to clear a value.

```text
nothing()
```

Shortcuts action: `is.workflow.actions.nothing`

## comment

Add a comment to the shortcut. Comments are visible in the Shortcuts app but don't affect execution.

```text
comment(text: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `Text` | — | The comment text. |

Shortcuts action: `is.workflow.actions.comment`

## ask

Prompt the user for text input.

```text
ask(prompt: Text, defaultAnswer: Text = "") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `prompt` | `Text` | — | The question to display. |
| `defaultAnswer` | `Text` | `""` | Pre-filled text in the input field. |

Returns the text the user entered.

Shortcuts action: `is.workflow.actions.ask`

## chooseFromList

Present a list of options and let the user pick one.

```text
chooseFromList(list: List<Text>, prompt: Text = "Choose") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `List<Text>` | — | The options to choose from. |
| `prompt` | `Text` | `"Choose"` | The prompt displayed above the list. |

Returns the selected item.

Shortcuts action: `is.workflow.actions.choosefromlist`

## wait

Pause execution for a number of seconds.

```text
wait(seconds: Number = 1)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `seconds` | `Number` | `1` | How long to wait, in seconds. |

Shortcuts action: `is.workflow.actions.delay`

## exitShortcut

Stop the shortcut immediately.

```text
exitShortcut()
```

Shortcuts action: `is.workflow.actions.exit`

## getClipboard

Get the contents of the clipboard.

```text
getClipboard() -> Text
```

Returns the clipboard text.

Shortcuts action: `is.workflow.actions.getclipboard`

## setClipboard

Copy a value to the clipboard.

```text
setClipboard(value: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Text` | — | The text to copy. |

Shortcuts action: `is.workflow.actions.setclipboard`

## getBatteryLevel

Get the device's battery level as a number from 0 to 100.

```text
getBatteryLevel() -> Number
```

Returns the battery percentage.

Shortcuts action: `is.workflow.actions.getbatterylevel`

## getCurrentDate

Get the current date and time.

```text
getCurrentDate() -> Text
```

Returns the date as text.

Shortcuts action: `is.workflow.actions.date`

## getDeviceDetails

Get information about the device.

```text
getDeviceDetails() -> Text
```

Returns device details as text.

Shortcuts action: `is.workflow.actions.getdevicedetails`

## count

Count the number of items in a list.

```text
count(input: List<Text>) -> Number
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `List<Text>` | — | The list to count. |

Returns the number of items.

Shortcuts action: `is.workflow.actions.count`

## base64Encode

Encode or decode text as Base64.

```text
base64Encode(input: Text, mode: Text = "Encode") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The text to encode or decode. |
| `mode` | `Text` | `"Encode"` | `"Encode"` or `"Decode"`. |

Returns the encoded or decoded text.

Shortcuts action: `is.workflow.actions.base64encode`

## hash

Generate a hash of the input text.

```text
hash(input: Text, type: Text = "MD5") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The text to hash. |
| `type` | `Text` | `"MD5"` | The hash algorithm, for example `"SHA256"`. |

Returns the hash as text.

Shortcuts action: `is.workflow.actions.hash`

## generateUUID

Generate a random UUID.

```text
generateUUID() -> Text
```

Returns a UUID string.

Shortcuts action: `is.workflow.actions.uuid`

## urlEncode

URL-encode or decode text.

```text
urlEncode(input: Text, mode: Text = "Encode") -> Text
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The text to encode or decode. |
| `mode` | `Text` | `"Encode"` | `"Encode"` or `"Decode"`. |

Returns the encoded or decoded text.

Shortcuts action: `is.workflow.actions.urlencode`

## runShortcut

Run another shortcut by name.

```text
runShortcut(name: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `Text` | — | The name of the shortcut to run. |

Shortcuts action: `is.workflow.actions.runworkflow`

## openApp

Open an app by its identifier.

```text
openApp(app: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `app` | `Text` | — | The app's bundle identifier. |

Shortcuts action: `is.workflow.actions.openapp`
