# Scripting

Control flow, variables, logic, prompts, and general shortcut utilities.

```chute
import Scripting;
```

## `addToVariable`

Appends this action's input to the specified variable, creating the variable if it does not exist.

This allows you to make a variable hold multiple items.

```chute
addToVariable(WFVariableName: Any, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVariableName` | `Any` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.appendvariable`

## `adjustDate`

Adds or subtracts an amount of time from the date passed into the action.

```chute
adjustDate(WFDate: Text, WFAdjustOperation: Text, WFDuration: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDate` | `Text` | — |
| `WFAdjustOperation` | `Text` | `"Add"` |
| `WFDuration` | `Number` | — |

> This action supports decimal numbers when adding or subtracting seconds, minutes, hours, or days. Otherwise only integers are supported.

Shortcuts action: `is.workflow.actions.adjustdate`

## `askForInput`

Displays a dialog prompting the user to enter a piece of information.

```chute
askForInput()
```

Shortcuts action: `is.workflow.actions.ask`

## `base64Encode`

Encodes or decodes text or files using Base64 encoding.

```chute
base64Encode(WFEncodeMode: Text, WFBase64LineBreakMode: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEncodeMode` | `Text` | `"Encode"` |
| `WFBase64LineBreakMode` | `Text` | `"Every 76 Characters"` |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.base64encode`

## `chooseFromList`

Presents a menu of the items passed as input to the action and outputs the user's selection.

```chute
chooseFromList(WFInput: Any, WFChooseFromListActionPrompt: Text, WFChooseFromListActionSelectMultiple: Boolean, WFChooseFromListActionSelectAll: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFChooseFromListActionPrompt` | `Text` | `""` |
| `WFChooseFromListActionSelectMultiple` | `Boolean` | false |
| `WFChooseFromListActionSelectAll` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.choosefromlist`

## `chooseFromMenu`

Presents a menu and runs different actions based on which menu item was chosen.

```chute
chooseFromMenu(WFMenuPrompt: Text, WFMenuItems: List<Any>)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMenuPrompt` | `Text` | — |
| `WFMenuItems` | `List<Any>` | One,Two |

Shortcuts action: `is.workflow.actions.choosefrommenu`

## `comment`

This action lets you explain how part of a shortcut works. When run, this action does nothing.

```chute
comment(WFCommentActionText: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCommentActionText` | `Text` | — |

Shortcuts action: `is.workflow.actions.comment`

## `continueInShortcutsApp`

Switches into the Shortcuts app and continues to the next action.

```chute
continueInShortcutsApp()
```

Shortcuts action: `is.workflow.actions.handoff`

## `convertTimeZone`

Converts the specified date and time from one time zone to another.

```chute
convertTimeZone(Date: Text, SourceTimeZone: Text, DestinationTimeZone: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Date` | `Text` | — |
| `SourceTimeZone` | `Text` | — |
| `DestinationTimeZone` | `Text` | — |

Shortcuts action: `is.workflow.actions.converttimezone`

## `count`

Counts the number of items, characters, words, sentences, or lines passed as input.

```chute
count(WFCountType: Text, Input: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCountType` | `Text` | `"Items"` |
| `Input` | `Any` | — |

> This is just like the Count in Sesame Street, but instead of a vampire, it's a Shortcuts action.

Shortcuts action: `is.workflow.actions.count`

## `createQrCode`

Creates a Quick Response (QR) code for the specified text.

```chute
createQrCode(WFText: Text, WFQRForegroundColor: Text, WFQRBackgroundColor: Text, WFQRRounded: Boolean, WFQRErrorCorrectionLevel: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFText` | `Text` | — |
| `WFQRForegroundColor` | `Text` | [object Object] |
| `WFQRBackgroundColor` | `Text` | [object Object] |
| `WFQRRounded` | `Boolean` | false |
| `WFQRErrorCorrectionLevel` | `Text` | `"Medium"` |

Shortcuts action: `is.workflow.actions.generatebarcode`

## `date`

Passes the specified date and time to the next action.

```chute
date(WFDateActionMode: Text, WFDateActionDate: Text, WFEventOccurrenceMode: Text, WFEventOccurrenceSpecifiedYear: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDateActionMode` | `Text` | `"Current Date"` |
| `WFDateActionDate` | `Text` | — |
| `WFEventOccurrenceMode` | `Text` | `"Next Occurrence"` |
| `WFEventOccurrenceSpecifiedYear` | `Text` | — |

Shortcuts action: `is.workflow.actions.date`

## `dictionary`

Passes the specified list of key-value pairs to the next action as a dictionary.

```chute
dictionary(WFItems: Dictionary)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFItems` | `Dictionary` | — |

> When coerced to text, the dictionary is represented as JSON.

Shortcuts action: `is.workflow.actions.dictionary`

## `dismissSiriAndContinue`

Switches into the Shortcuts app and continues to the next action.

```chute
dismissSiriAndContinue()
```

Shortcuts action: `is.workflow.actions.dismisssiri`

## `findApps`

```chute
findApps()
```

Shortcuts action: `is.workflow.actions.filter.apps`

## `formatDate`

Formats a date and time into text.

```chute
formatDate(WFDateFormatStyle: Text, WFRelativeDateFormatStyle: Text, WFTimeFormatStyle: Text, WFISO8601IncludeTime: Boolean, WFDateFormat: Text, WFDate: Text, WFLocale: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDateFormatStyle` | `Text` | `"Short"` |
| `WFRelativeDateFormatStyle` | `Text` | `"Medium"` |
| `WFTimeFormatStyle` | `Text` | `"Short"` |
| `WFISO8601IncludeTime` | `Boolean` | — |
| `WFDateFormat` | `Text` | — |
| `WFDate` | `Text` | — |
| `WFLocale` | `Text` | — |

> Custom format strings use the format patterns from Unicode Technical Standard #35 (unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns).

Shortcuts action: `is.workflow.actions.format.date`

## `formatFileSize`

Formats a file size into text.

```chute
formatFileSize(WFFileSizeFormat: Text, WFFileSizeIncludeUnits: Boolean, WFFileSize: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFileSizeFormat` | `Text` | `"Automatic"` |
| `WFFileSizeIncludeUnits` | `Boolean` | true |
| `WFFileSize` | `Number` | — |

> 1000 bytes are shown as 1 KB.

Shortcuts action: `is.workflow.actions.format.filesize`

## `formatNumber`

Formats a number into text.

```chute
formatNumber(WFNumber: Number, WFNumberFormatDecimalPlaces: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNumber` | `Number` | — |
| `WFNumberFormatDecimalPlaces` | `Number` | 2 |

Shortcuts action: `is.workflow.actions.format.number`

## `generateHash`

Generates a MD5/SHA1 hash from the input.

```chute
generateHash(WFHashType: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHashType` | `Text` | `"MD5"` |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.hash`

## `getAddressesFromInput`

Returns any street addresses found in the output from the previous action.

```chute
getAddressesFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.address`

## `getContactsFromInput`

Gets contacts from the result of the previous action.

```chute
getContactsFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.contacts`

## `getDatesFromInput`

Returns any dates found in the output from the previous action.

```chute
getDatesFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.date`

## `getDetailsOfAppStoreApp`

```chute
getDetailsOfAppStoreApp()
```

Shortcuts action: `is.workflow.actions.properties.appstore`

## `getDictionaryFromInput`

Makes a dictionary from the text passed as input. JSON (like {"foo": "bar"}), key-value pairs (like foo=bar&baz=biz), and XML-based plist are supported.

```chute
getDictionaryFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.dictionary`

## `getDictionaryValue`

Gets the value for the specified key in the dictionary passed into the action.

```chute
getDictionaryValue(WFGetDictionaryValueType: Text, WFDictionaryKey: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetDictionaryValueType` | `Text` | `"Value"` |
| `WFDictionaryKey` | `Text` | — |
| `WFInput` | `Any` | — |

> You can reference values deep inside of a dictionary by providing multiple keys separated by dots. For example, to get the value "soup" from the dictionary {"beverages": [{"favorite": "soup"}]}, you can specify the key path "beverages.1.favorite".

Shortcuts action: `is.workflow.actions.getvalueforkey`

## `getEmailAddressesFromInput`

Returns any email addresses found in the output from the previous action.

```chute
getEmailAddressesFromInput(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.detect.emailaddress`

## `getFileOfType`

Returns a particular file type from the input.

```chute
getFileOfType(WFFileType: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFileType` | `Text` | `"public.rtf"` |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.gettypeaction`

## `getImagesFromInput`

Gets images from the result of the previous action.

For example, this action can get the album art of a song, or all the images on a web page.

```chute
getImagesFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.images`

## `getItemFromList`

Returns one or more items from the list passed as input. You can get the first item, the last item, a random item, the item at a particular index, or items in a range of indexes.

```chute
getItemFromList(WFItemSpecifier: Text, WFItemIndex: Number, WFItemRangeStart: Number, WFItemRangeEnd: Number, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFItemSpecifier` | `Text` | `"First Item"` |
| `WFItemIndex` | `Number` | — |
| `WFItemRangeStart` | `Number` | — |
| `WFItemRangeEnd` | `Number` | — |
| `WFInput` | `Any` | — |

> Lists use one-based indexing, so the first item is at index 1, the second is at index 2, etc.

Shortcuts action: `is.workflow.actions.getitemfromlist`

## `getName`

Returns the name of every item passed as input. Depending on the input, this could be a file name, the title of a website, the title of a calendar event, etc.

```chute
getName(WFInput: Any, GetWebPageTitle: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `GetWebPageTitle` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.getitemname`

## `getNumbersFromInput`

Returns numbers from the previous action's output.

```chute
getNumbersFromInput(WFInput: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Number` | — |

Shortcuts action: `is.workflow.actions.detect.number`

## `getObjectOfClass`

Returns a particular object class from the input.

```chute
getObjectOfClass(Class: Text, Input: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Class` | `Text` | — |
| `Input` | `Any` | — |

Shortcuts action: `is.workflow.actions.getclassaction`

## `getPhoneNumbersFromInput`

Returns any phone numbers found in the output from the previous action.

```chute
getPhoneNumbersFromInput(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.detect.phonenumber`

## `getTextFromInput`

Returns text from the previous action's output.

For example, this action can get the name of a photo or song, or the text of a web page.

```chute
getTextFromInput(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.detect.text`

## `getTimeBetweenDates`

Subtracts the specified date from the date passed into the action. For example, this action could get the number of minutes from now until a calendar event passed in as input.

```chute
getTimeBetweenDates(WFTimeUntilFromDate: Text, WFInput: Text, WFTimeUntilUnit: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTimeUntilFromDate` | `Text` | — |
| `WFInput` | `Text` | — |
| `WFTimeUntilUnit` | `Text` | `"Minutes"` |

> This action outputs a negative number if the input date takes place before the specified date.

Shortcuts action: `is.workflow.actions.gettimebetweendates`

## `getType`

Returns the type of every item passed as input. For example, if a URL is passed, this action will return “URL”.

```chute
getType(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.getitemtype`

## `getUrlsFromInput`

Returns any links found in the output from the previous action.

```chute
getUrlsFromInput(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.detect.link`

## `getVariable`

Gets the value of the specified variable and passes it to the next action.

```chute
getVariable(WFVariable: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVariable` | `Any` | — |

Shortcuts action: `is.workflow.actions.getvariable`

## `if`

Tests if a condition is true, and if so, runs the actions inside. Otherwise, the actions under “Otherwise” are run.

```chute
if()
```

Shortcuts action: `is.workflow.actions.conditional`

## `input`

Stops execution of the current shortcut and dismisses the shortcut on screen. No more actions will be run after this action.

```chute
input(WFInputType: Text, WFInputSurface: Text, WFNoInputBehavior: Text, WFStopAndRespondResponse: Text, WFAskForType: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputType` | `Text` | — |
| `WFInputSurface` | `Text` | `""` |
| `WFNoInputBehavior` | `Text` | `"Stop and Respond"` |
| `WFStopAndRespondResponse` | `Text` | — |
| `WFAskForType` | `Text` | `"Photos"` |

Shortcuts action: `is.workflow.actions.input`

## `list`

Allows you to specify a list of items to be passed to the next action.

```chute
list(WFItems: List<Any>)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFItems` | `List<Any>` | One,Two |

> If you specify a variable, the contents of that variable will be included in the list.

Shortcuts action: `is.workflow.actions.list`

## `nothing`

This action does nothing and produces no output. It is useful to separate blocks of actions, or to explicitly pass an empty input to an action.

```chute
nothing()
```

Shortcuts action: `is.workflow.actions.nothing`

## `openApp`

Opens the specified app.

```chute
openApp(WFSelectedApp: Text, WFAppName: Text, WFWindowingFormat: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSelectedApp` | `Text` | — |
| `WFAppName` | `Text` | — |
| `WFWindowingFormat` | `Text` | `"Full Screen"` |

Shortcuts action: `is.workflow.actions.openapp`

## `openFile`

Opens the input as a file in the specified app.

```chute
openFile(WFOpenInAskWhenRun: Boolean, WFSelectedApp: Text, WFAppName: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFOpenInAskWhenRun` | `Boolean` | false |
| `WFSelectedApp` | `Text` | — |
| `WFAppName` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.openin`

## `repeat`

Repeats the contained actions, running them the specified number of times.

```chute
repeat(WFRepeatCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRepeatCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.repeat.count`

## `repeatWithEach`

Takes a list of items as input, and runs the contained actions once for each item in the list.

```chute
repeatWithEach(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.repeat.each`

## `runApplescript`

This action executes an AppleScript.

```chute
runApplescript(Input: Any, Script: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Input` | `Any` | — |
| `Script` | `Text` | `"on run {input, parameters}
    (* Your script goes here *)
    return input
end run"` |

Shortcuts action: `is.workflow.actions.runapplescript`

## `runJavascriptForMacAutomation`

This action executes a JavaScript for Automation (JXA) script.

```chute
runJavascriptForMacAutomation(Input: Any, Script: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Input` | `Any` | — |
| `Script` | `Text` | `"function run(input, parameters) {
    // Your script goes here
    return input;
}"` |

Shortcuts action: `is.workflow.actions.runjavascriptforautomation`

## `runScriptOverSsh`

Runs a script on a remote computer over SSH.

```chute
runScriptOverSsh(WFSSHScript: Text, WFSSHHost: Text, WFSSHPort: Text, WFSSHUser: Text, WFSSHAuthenticationType: Text, WFSSHPassword: Text, WFSSHKey: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSSHScript` | `Text` | — |
| `WFSSHHost` | `Text` | — |
| `WFSSHPort` | `Text` | `"22"` |
| `WFSSHUser` | `Text` | — |
| `WFSSHAuthenticationType` | `Text` | `"Password"` |
| `WFSSHPassword` | `Text` | — |
| `WFSSHKey` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.runsshscript`

## `runShellScript`

This action executes a UNIX shell script. The script will execute starting in your user’s home directory.

```chute
runShellScript(Script: Text, Shell: Text, Input: Any, InputMode: Text, RunAsRoot: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Script` | `Text` | — |
| `Shell` | `Text` | — |
| `Input` | `Any` | — |
| `InputMode` | `Text` | `"to stdin"` |
| `RunAsRoot` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.runshellscript`

## `scanQrOrBarcode`

Scans a QR code or barcode using the camera, and returns the text/URL that is found.

```chute
scanQrOrBarcode()
```

Shortcuts action: `is.workflow.actions.scanbarcode`

## `setDictionaryValue`

Sets a value in the dictionary passed into the action. 

```chute
setDictionaryValue(WFDictionaryKey: Text, WFDictionaryValue: Text, WFDictionary: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDictionaryKey` | `Text` | — |
| `WFDictionaryValue` | `Text` | — |
| `WFDictionary` | `Any` | — |

Shortcuts action: `is.workflow.actions.setvalueforkey`

## `setName`

Sets the name of the item passed as input.

```chute
setName(WFName: Text, WFDontIncludeFileExtension: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFName` | `Text` | — |
| `WFDontIncludeFileExtension` | `Boolean` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.setitemname`

## `setVariable`

Sets the value of the specified variable to the input of this action.

```chute
setVariable(WFInput: Any, WFVariableName: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFVariableName` | `Any` | — |

Shortcuts action: `is.workflow.actions.setvariable`

## `showContentAttribution`

Shows the Content Source of Input contents

```chute
showContentAttribution(Input: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Input` | `Any` | — |

Shortcuts action: `is.workflow.actions.debug.contentattribution`

## `stopAndOutput`

Stops execution of the current shortcut, and outputs content. This action is useful when:
• Running a shortcut from another shortcut (using the Run Shortcut action). The output will be used as the output of the Run Shortcut action.
• Running a shortcut from Quick Actions in Finder on macOS. The output will be saved as a file alongside the files selected in Finder.
• Running a shortcut from Services on macOS. The output will replace the selected text, if applicable.
• Or, when running a shortcut from another location that supports output, like the command-line or the Shortcuts URL scheme.

No more actions will be run after this action.

```chute
stopAndOutput(WFOutput: Text, WFNoOutputSurfaceBehavior: Text, WFResponse: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFOutput` | `Text` | `""` |
| `WFNoOutputSurfaceBehavior` | `Text` | `"Do Nothing"` |
| `WFResponse` | `Text` | `""` |

Shortcuts action: `is.workflow.actions.output`

## `stopThisShortcut`

Stops execution of the current shortcut and dismisses the shortcut on screen. No more actions will be run after this action.

```chute
stopThisShortcut()
```

Shortcuts action: `is.workflow.actions.exit`

## `unknownIntent`

```chute
unknownIntent(ShowWhenRun: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `ShowWhenRun` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.sirikit.donation.handle`

## `unknownUserActivity`

```chute
unknownUserActivity()
```

Shortcuts action: `is.workflow.actions.useractivity.open`

## `useModel`

Use a model to handle complex requests in your shortcuts.

```chute
useModel(WFLLMPrompt: Text, WFLLMModel: Text, FollowUp: Boolean, WFGenerativeResultType: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLLMPrompt` | `Text` | — |
| `WFLLMModel` | `Text` | — |
| `FollowUp` | `Boolean` | false |
| `WFGenerativeResultType` | `Text` | — |

Shortcuts action: `is.workflow.actions.askllm`

## `wait`

Waits for the specified number of seconds before continuing with the next action.

```chute
wait(WFDelayTime: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDelayTime` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.delay`

## `waitToReturn`

Pauses execution until you leave the Shortcuts app and return to it.

This action might be useful after an action that switches apps, to pause execution until you return to the Shortcuts app.

This action will only take effect when running shortcuts in the Shortcuts app.

```chute
waitToReturn()
```

Shortcuts action: `is.workflow.actions.waittoreturn`
