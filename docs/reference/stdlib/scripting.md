# Scripting

Control flow, variables, logic, prompts, and general shortcut utilities.

```chute
import Scripting;
```

## `addToVariable`

Appends this action's input to the specified variable, creating the variable if it does not exist.

This allows you to make a variable hold multiple items.

```chute
addToVariable(variable: Text, input: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `variable` | Text | — |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.appendvariable`

## `adjustDate`

Adds or subtracts an amount of time from the date passed into the action.

```chute
adjustDate(date: Text, operation: Enum, duration: Number) -> Date
```

| Parameter | Type | Default |
| --- | --- | --- |
| `date` | Text | — |
| `operation` | Add \\| Subtract \\| Get Start of Minute \\| Get Start of Hour \\| Get Start of Day \\| Get Start of Week \\| Get Start of Month \\| Get Start of Year | `"Add"` |
| `duration` | Number | — |

> This action supports decimal numbers when adding or subtracting seconds, minutes, hours, or days. Otherwise only integers are supported.

Shortcuts action: `is.workflow.actions.adjustdate`

## `askForInput`

Displays a dialog prompting the user to enter a piece of information.

```chute
askForInput(WFAskActionPrompt: Any, WFInputType: AskForInputType, WFAskActionDefaultAnswer: Any, WFAskActionDefaultAnswerNumber: Any, urlAnswer: Any, WFAskActionDefaultAnswerURL: Any, WFAskActionDefaultAnswerDate: Any, WFAskActionDefaultAnswerTime: Any, WFAskActionDefaultAnswerDateAndTime: Any, WFAskActionAllowsDecimalNumbers: Boolean, WFAskActionAllowsNegativeNumbers: Boolean, WFAllowsMultilineText: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAskActionPrompt` | Any | — |
| `WFInputType` | Text \\| Number \\| URL \\| Date \\| Time \\| Date and Time | — |
| `WFAskActionDefaultAnswer` | Any | — |
| `WFAskActionDefaultAnswerNumber` | Any | — |
| `urlAnswer` | Any | — |
| `WFAskActionDefaultAnswerURL` | Any | — |
| `WFAskActionDefaultAnswerDate` | Any | — |
| `WFAskActionDefaultAnswerTime` | Any | — |
| `WFAskActionDefaultAnswerDateAndTime` | Any | — |
| `WFAskActionAllowsDecimalNumbers` | Boolean | — |
| `WFAskActionAllowsNegativeNumbers` | Boolean | — |
| `WFAllowsMultilineText` | Boolean | — |

Shortcuts action: `is.workflow.actions.ask`

## `base64Encode`

Encodes or decodes text or files using Base64 encoding.

```chute
base64Encode(mode: Enum, lineBreaks: Enum, input: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | Encode \\| Decode | `"Encode"` |
| `lineBreaks` | None \\| Every 64 Characters \\| Every 76 Characters | `"Every 76 Characters"` |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.base64encode`

## `chooseFromList`

Presents a menu of the items passed as input to the action and outputs the user's selection.

```chute
chooseFromList(list: Any, prompt: Text, selectMultiple: Boolean, selectAllInitially: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `list` | Any | — |
| `prompt` | Text | `""` |
| `selectMultiple` | Boolean | false |
| `selectAllInitially` | Boolean | false |

Shortcuts action: `is.workflow.actions.choosefromlist`

## `chooseFromMenu`

Presents a menu and runs different actions based on which menu item was chosen.

```chute
chooseFromMenu(prompt: Text, items: List<Any>)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `prompt` | Text | — |
| `items` | List&lt;Any&gt; | One,Two |

Shortcuts action: `is.workflow.actions.choosefrommenu`

## `convertTimeZone`

Converts the specified date and time from one time zone to another.

```chute
convertTimeZone(date: Text, timeZone: Text, destinationTimeZone: Text) -> Date
```

| Parameter | Type | Default |
| --- | --- | --- |
| `date` | Text | — |
| `timeZone` | Text | — |
| `destinationTimeZone` | Text | — |

Shortcuts action: `is.workflow.actions.converttimezone`

## `convertToFileType`

Returns a particular file type from the input.

```chute
convertToFileType(type: Text, input: Any) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Text | `"public.rtf"` |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.gettypeaction`

## `count`

Counts the number of items, characters, words, sentences, or lines passed as input.

```chute
count(type: Enum, input: Any) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Items \\| Characters \\| Words \\| Sentences \\| Lines | `"Items"` |
| `input` | Any | — |

> This is just like the Count in Sesame Street, but instead of a vampire, it's a Shortcuts action.

Shortcuts action: `is.workflow.actions.count`

## `createQrCode`

Creates a Quick Response (QR) code for the specified text.

```chute
createQrCode(text: Text, foregroundColor: Text, backgroundColor: Text, rounded: Boolean, errorCorrection: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |
| `foregroundColor` | Text | `"#000000"` |
| `backgroundColor` | Text | `"#FFFFFF"` |
| `rounded` | Boolean | false |
| `errorCorrection` | Low \\| Medium \\| Quartile \\| High | `"Medium"` |

Shortcuts action: `is.workflow.actions.generatebarcode`

## `date`

Passes the specified date and time to the next action.

```chute
date(WFDateActionMode: Text, WFDateActionDate: Text, occurrence: Enum, year: Text) -> Date
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDateActionMode` | Text | `"Current Date"` |
| `WFDateActionDate` | Text | — |
| `occurrence` | Next Occurrence \\| Specified Year | `"Next Occurrence"` |
| `year` | Text | — |

Shortcuts action: `is.workflow.actions.date`

## `dictionary`

Passes the specified list of key-value pairs to the next action as a dictionary.

```chute
dictionary(items: Dictionary) -> Dictionary
```

| Parameter | Type | Default |
| --- | --- | --- |
| `items` | Dictionary | — |

> When coerced to text, the dictionary is represented as JSON.

Shortcuts action: `is.workflow.actions.dictionary`

## `dismissSiri`

Switches into the Shortcuts app and continues to the next action.

```chute
dismissSiri()
```

Shortcuts action: `is.workflow.actions.dismisssiri`

## `findApps`

```chute
findApps(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> App
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Name | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.apps`

## `formatDate`

Formats a date and time into text.

```chute
formatDate(dateFormat: Enum, alternateFormat: Enum, timeFormat: Enum, includeIso8601Time: Boolean, formatString: Text, date: Text, locale: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `dateFormat` | None \\| Short \\| Medium \\| Long \\| Relative \\| RFC 2822 \\| ISO 8601 \\| Custom | `"Short"` |
| `alternateFormat` | Short \\| Medium \\| Long | `"Medium"` |
| `timeFormat` | None \\| Short \\| Medium \\| Long \\| Relative | `"Short"` |
| `includeIso8601Time` | Boolean | — |
| `formatString` | Text | — |
| `date` | Text | — |
| `locale` | Text | — |

> Custom format strings use the format patterns from Unicode Technical Standard #35 (unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns).

Shortcuts action: `is.workflow.actions.format.date`

## `formatFileSize`

Formats a file size into text.

```chute
formatFileSize(format: Enum, includeUnits: Boolean, fileSize: Number) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `format` | Automatic \\| Bytes \\| KB \\| MB \\| GB \\| TB \\| PB \\| EB \\| ZB \\| YB or Higher | `"Automatic"` |
| `includeUnits` | Boolean | true |
| `fileSize` | Number | — |

> 1000 bytes are shown as 1 KB.

Shortcuts action: `is.workflow.actions.format.filesize`

## `formatNumber`

Formats a number into text.

```chute
formatNumber(number: Number, WFNumberFormatDecimalPlaces: Number) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `number` | Number | — |
| `WFNumberFormatDecimalPlaces` | Number | 2 |

Shortcuts action: `is.workflow.actions.format.number`

## `generateHash`

Generates a MD5/SHA1 hash from the input.

```chute
generateHash(type: Enum, input: File) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | MD5 \\| SHA1 \\| SHA256 \\| SHA512 | `"MD5"` |
| `input` | File | — |

Shortcuts action: `is.workflow.actions.hash`

## `getAddressesFromInput`

Returns any street addresses found in the output from the previous action.

```chute
getAddressesFromInput(input: Location) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Location | — |

Shortcuts action: `is.workflow.actions.detect.address`

## `getContactsFromInput`

Gets contacts from the result of the previous action.

```chute
getContactsFromInput(input: Contact) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Contact | — |

Shortcuts action: `is.workflow.actions.detect.contacts`

## `getContentOfType`

Returns a particular object class from the input.

```chute
getContentOfType(class: Text, input: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `class` | Text | — |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.getclassaction`

## `getDatesFromInput`

Returns any dates found in the output from the previous action.

```chute
getDatesFromInput(input: Date) -> Date
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Date | — |

Shortcuts action: `is.workflow.actions.detect.date`

## `getDetailsOfAppStoreApp`

```chute
getDetailsOfAppStoreApp(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Artist \\| Price \\| Store URL \\| Store ID \\| Rating \\| Rating Count \\| Release Date \\| Artwork \\| Artwork URL \\| Supported Languages \\| Is Universal \\| Category \\| Description \\| Version \\| Release Notes \\| Content Rating \\| Minimum OS Version \\| File Size \\| Supported Devices \\| Currency Code \\| Screenshot URLs \\| iPad Screenshot URLs | — |

Shortcuts action: `is.workflow.actions.properties.appstore`

## `getDictionaryFromInput`

Makes a dictionary from the text passed as input. JSON (like {"foo": "bar"}), key-value pairs (like foo=bar&baz=biz), and XML-based plist are supported.

```chute
getDictionaryFromInput(input: Dictionary) -> Dictionary
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Dictionary | — |

Shortcuts action: `is.workflow.actions.detect.dictionary`

## `getDictionaryValue`

Gets the value for the specified key in the dictionary passed into the action.

```chute
getDictionaryValue(get: Enum, key: Text, dictionary: Dictionary) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Value \\| All Keys \\| All Values | `"Value"` |
| `key` | Text | — |
| `dictionary` | Dictionary | — |

> You can reference values deep inside of a dictionary by providing multiple keys separated by dots. For example, to get the value "soup" from the dictionary {"beverages": [{"favorite": "soup"}]}, you can specify the key path "beverages.1.favorite".

Shortcuts action: `is.workflow.actions.getvalueforkey`

## `getEmailAddressesFromInput`

Returns any email addresses found in the output from the previous action.

```chute
getEmailAddressesFromInput(input: Text) -> Email
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Text | — |

Shortcuts action: `is.workflow.actions.detect.emailaddress`

## `getImagesFromInput`

Gets images from the result of the previous action.

For example, this action can get the album art of a song, or all the images on a web page.

```chute
getImagesFromInput(input: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Image | — |

Shortcuts action: `is.workflow.actions.detect.images`

## `getItemFromList`

Returns one or more items from the list passed as input. You can get the first item, the last item, a random item, the item at a particular index, or items in a range of indexes.

```chute
getItemFromList(get: Enum, index: Number, startIndex: Number, endIndex: Number, list: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | First Item \\| Last Item \\| Random Item \\| Item At Index \\| Items in Range | `"First Item"` |
| `index` | Number | — |
| `startIndex` | Number | — |
| `endIndex` | Number | — |
| `list` | Any | — |

> Lists use one-based indexing, so the first item is at index 1, the second is at index 2, etc.

Shortcuts action: `is.workflow.actions.getitemfromlist`

## `getName`

Returns the name of every item passed as input. Depending on the input, this could be a file name, the title of a website, the title of a calendar event, etc.

```chute
getName(item: Any, getWebPageTitle: Boolean) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `item` | Any | — |
| `getWebPageTitle` | Boolean | true |

Shortcuts action: `is.workflow.actions.getitemname`

## `getNumbersFromInput`

Returns numbers from the previous action's output.

```chute
getNumbersFromInput(input: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Number | — |

Shortcuts action: `is.workflow.actions.detect.number`

## `getPhoneNumbersFromInput`

Returns any phone numbers found in the output from the previous action.

```chute
getPhoneNumbersFromInput(input: Text) -> Phone
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Text | — |

Shortcuts action: `is.workflow.actions.detect.phonenumber`

## `getTextFromInput`

Returns text from the previous action's output.

For example, this action can get the name of a photo or song, or the text of a web page.

```chute
getTextFromInput(input: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.detect.text`

## `getTimeBetweenDates`

Subtracts the specified date from the date passed into the action. For example, this action could get the number of minutes from now until a calendar event passed in as input.

```chute
getTimeBetweenDates(firstDate: Text, secondDate: Text, in: Enum) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `firstDate` | Text | — |
| `secondDate` | Text | — |
| `in` | Total Time \\| Seconds \\| Minutes \\| Hours \\| Days \\| Weeks \\| Months \\| Years | `"Minutes"` |

> This action outputs a negative number if the input date takes place before the specified date.

Shortcuts action: `is.workflow.actions.gettimebetweendates`

## `getType`

Returns the type of every item passed as input. For example, if a URL is passed, this action will return “URL”.

```chute
getType(item: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `item` | Any | — |

Shortcuts action: `is.workflow.actions.getitemtype`

## `getUrlsFromInput`

Returns any links found in the output from the previous action.

```chute
getUrlsFromInput(input: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Text | — |

Shortcuts action: `is.workflow.actions.detect.link`

## `getVariable`

Gets the value of the specified variable and passes it to the next action.

```chute
getVariable(variable: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `variable` | Any | — |

Shortcuts action: `is.workflow.actions.getvariable`

## `handoff`

Switches into the Shortcuts app and continues to the next action.

```chute
handoff()
```

Shortcuts action: `is.workflow.actions.handoff`

## `if`

Tests if a condition is true, and if so, runs the actions inside. Otherwise, the actions under “Otherwise” are run.

```chute
if()
```

Shortcuts action: `is.workflow.actions.conditional`

## `input`

Stops execution of the current shortcut and dismisses the shortcut on screen. No more actions will be run after this action.

```chute
input(inputType: Text, inputSurface: Text, ifTheresNoInput: Enum, response: Text, type: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `inputType` | Text | — |
| `inputSurface` | Text | `""` |
| `ifTheresNoInput` | Stop and Respond \\| Ask For \\| Get Clipboard \\| Continue | `"Stop and Respond"` |
| `response` | Text | — |
| `type` | Files \\| Text \\| Date \\| Photos \\| Contacts \\| Email Address \\| Music \\| Phone Number | `"Photos"` |

Shortcuts action: `is.workflow.actions.input`

## `list`

Allows you to specify a list of items to be passed to the next action.

```chute
list(items: List<Any>) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `items` | List&lt;Any&gt; | One,Two |

> If you specify a variable, the contents of that variable will be included in the list.

Shortcuts action: `is.workflow.actions.list`

## `nothing`

This action does nothing and produces no output. It is useful to separate blocks of actions, or to explicitly pass an empty input to an action.

```chute
nothing() -> Any
```

Shortcuts action: `is.workflow.actions.nothing`

## `openApp`

Opens the specified app.

```chute
openApp(app: Text, appName: Text, windowLocation&Size: Enum) -> App
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | — |
| `appName` | Text | — |
| `windowLocation&Size` | Full Screen \\| Left \\| Right \\| Top \\| Bottom \\| Top Leading \\| Top Trailing \\| Bottom Leading \\| Bottom Trailing \\| Left Third \\| Middle Third \\| Right Third | `"Full Screen"` |

Shortcuts action: `is.workflow.actions.openapp`

## `openFile`

Opens the input as a file in the specified app.

```chute
openFile(showOpenInMenu: Boolean, app: Text, appName: Text, file: File)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `showOpenInMenu` | Boolean | false |
| `app` | Text | — |
| `appName` | Text | — |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.openin`

## `repeat`

Repeats the contained actions, running them the specified number of times.

```chute
repeat(WFRepeatCount: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRepeatCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.repeat.count`

## `repeatWithEach`

Takes a list of items as input, and runs the contained actions once for each item in the list.

```chute
repeatWithEach(items: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `items` | Any | — |

Shortcuts action: `is.workflow.actions.repeat.each`

## `runApplescript`

This action executes an AppleScript.

```chute
runApplescript(input: File, Script: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | File | — |
| `Script` | Text | `"on run {input, parameters}
    (* Your script goes here *)
    return input
end run"` |

Shortcuts action: `is.workflow.actions.runapplescript`

## `runJavascriptForMacAutomation`

This action executes a JavaScript for Automation (JXA) script.

```chute
runJavascriptForMacAutomation(input: File, Script: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | File | — |
| `Script` | Text | `"function run(input, parameters) {
    // Your script goes here
    return input;
}"` |

Shortcuts action: `is.workflow.actions.runjavascriptforautomation`

## `runScriptOverSsh`

Runs a script on a remote computer over SSH.

```chute
runScriptOverSsh(script: Text, host: Text, port: Text, user: Text, authentication: Enum, password: Text, sshKey: Text, input: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `script` | Text | — |
| `host` | Text | — |
| `port` | Text | `"22"` |
| `user` | Text | — |
| `authentication` | Password \\| SSH Key | `"Password"` |
| `password` | Text | — |
| `sshKey` | Text | — |
| `input` | File | — |

Shortcuts action: `is.workflow.actions.runsshscript`

## `runShellScript`

This action executes a UNIX shell script. The script will execute starting in your user’s home directory.

```chute
runShellScript(Script: Text, shell: Text, input: File, passInput: Enum, runAsAdministrator: Boolean) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Script` | Text | — |
| `shell` | Text | — |
| `input` | File | — |
| `passInput` | to stdin \\| as arguments | `"to stdin"` |
| `runAsAdministrator` | Boolean | false |

Shortcuts action: `is.workflow.actions.runshellscript`

## `scanQrOrBarcode`

Scans a QR code or barcode using the camera, and returns the text/URL that is found.

```chute
scanQrOrBarcode() -> Barcode
```

Shortcuts action: `is.workflow.actions.scanbarcode`

## `setDictionaryValue`

Sets a value in the dictionary passed into the action. 

```chute
setDictionaryValue(key: Text, value: Text, dictionary: Dictionary) -> Dictionary
```

| Parameter | Type | Default |
| --- | --- | --- |
| `key` | Text | — |
| `value` | Text | — |
| `dictionary` | Dictionary | — |

Shortcuts action: `is.workflow.actions.setvalueforkey`

## `setName`

Sets the name of the item passed as input.

```chute
setName(name: Text, don'tIncludeFileExtension: Boolean, input: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `name` | Text | — |
| `don'tIncludeFileExtension` | Boolean | — |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.setitemname`

## `setVariable`

Sets the value of the specified variable to the input of this action.

```chute
setVariable(input: Any, variable: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Any | — |
| `variable` | Text | — |

Shortcuts action: `is.workflow.actions.setvariable`

## `stopAndOutput`

Stops execution of the current shortcut, and outputs content. This action is useful when:
• Running a shortcut from another shortcut (using the Run Shortcut action). The output will be used as the output of the Run Shortcut action.
• Running a shortcut from Quick Actions in Finder on macOS. The output will be saved as a file alongside the files selected in Finder.
• Running a shortcut from Services on macOS. The output will replace the selected text, if applicable.
• Or, when running a shortcut from another location that supports output, like the command-line or the Shortcuts URL scheme.

No more actions will be run after this action.

```chute
stopAndOutput(WFOutput: Text, ifTheresNowhereToOutput: Enum, WFResponse: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFOutput` | Text | `""` |
| `ifTheresNowhereToOutput` | Respond \\| Do Nothing \\| Copy to Clipboard | `"Do Nothing"` |
| `WFResponse` | Text | `""` |

Shortcuts action: `is.workflow.actions.output`

## `stopThisShortcut`

Stops execution of the current shortcut and dismisses the shortcut on screen. No more actions will be run after this action.

```chute
stopThisShortcut()
```

Shortcuts action: `is.workflow.actions.exit`

## `useModel`

Use a model to handle complex requests in your shortcuts.

```chute
useModel(request: Text, model: Text, followUp: Boolean, output: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `request` | Text | — |
| `model` | Text | — |
| `followUp` | Boolean | false |
| `output` | Text | — |

Shortcuts action: `is.workflow.actions.askllm`

## `wait`

Waits for the specified number of seconds before continuing with the next action.

```chute
wait(WFDelayTime: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDelayTime` | Number | 1 |

Shortcuts action: `is.workflow.actions.delay`

## `waitToReturn`

Pauses execution until you leave the Shortcuts app and return to it.

This action might be useful after an action that switches apps, to pause execution until you return to the Shortcuts app.

This action will only take effect when running shortcuts in the Shortcuts app.

```chute
waitToReturn()
```

Shortcuts action: `is.workflow.actions.waittoreturn`
