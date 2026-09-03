# Apps

App-specific integrations.

```chute
import Apps;
```

## `addTodoistItem`

Adds a new item to Todoist.

```chute
addTodoistItem(WFTodoistContent: Text, WFTodoistProject: Text, WFTodoistDueDate: Text, WFTodoistReminder: Text, WFTodoistReminderType: Text, WFTodoistPriority: Text, WFTodoistNotes: Text, WFTodoistFile: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTodoistContent` | `Text` | — |
| `WFTodoistProject` | `Text` | `"Inbox"` |
| `WFTodoistDueDate` | `Text` | — |
| `WFTodoistReminder` | `Text` | — |
| `WFTodoistReminderType` | `Text` | `"Email"` |
| `WFTodoistPriority` | `Text` | `"4"` |
| `WFTodoistNotes` | `Text` | — |
| `WFTodoistFile` | `Any` | — |

Shortcuts action: `is.workflow.actions.todoist.add`

## `addToInstapaper`

Adds the input to Instapaper.

```chute
addToInstapaper(WFInstapaperFolder: Text, WFInputURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInstapaperFolder` | `Text` | — |
| `WFInputURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.instapaper.add`

## `addToPinboard`

Adds the URL passed into the action to your Pinboard.

```chute
addToPinboard(WFPinTitle: Text, WFPinTags: Text, WFPinPublic: Boolean, WFPinUnread: Boolean, WFPinDescription: Text, WFPinboardURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPinTitle` | `Text` | — |
| `WFPinTags` | `Text` | — |
| `WFPinPublic` | `Boolean` | true |
| `WFPinUnread` | `Boolean` | true |
| `WFPinDescription` | `Text` | — |
| `WFPinboardURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.pinboard.add`

## `addToPocket`

Adds the input to Pocket.

```chute
addToPocket(WFPocketTags: Text, WFInputURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPocketTags` | `Text` | — |
| `WFInputURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.pocket.add`

## `addTrelloCard`

Creates a new card on the specified list and board in your Trello account.

```chute
addTrelloCard(WFTrelloName: Text, WFTrelloBoard: Text, WFTrelloList: Text, WFTrelloDueDate: Text, WFTrelloCardPosition: Text, WFTrelloAttachments: Any, WFTrelloDescription: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | `Text` | — |
| `WFTrelloBoard` | `Text` | — |
| `WFTrelloList` | `Text` | — |
| `WFTrelloDueDate` | `Text` | — |
| `WFTrelloCardPosition` | `Text` | `"Top"` |
| `WFTrelloAttachments` | `Any` | — |
| `WFTrelloDescription` | `Text` | — |

Shortcuts action: `is.workflow.actions.trello.add.card`

## `appendToDropboxTextFile`

Adds the text passed as input to the end of the specified file.

```chute
appendToDropboxTextFile(WFFilePath: Text, WFAppendFileWriteMode: Text, WFAppendOnNewLine: Boolean, WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFilePath` | `Text` | — |
| `WFAppendFileWriteMode` | `Text` | `"Append"` |
| `WFAppendOnNewLine` | `Boolean` | true |
| `WFInput` | `Text` | — |

> If no file exists yet at the specified path, a new file will be created. Make sure to include a file extension (usually .txt) at the end of your path.

Shortcuts action: `is.workflow.actions.dropbox.appendfile`

## `appendToEvernote`

Finds a note using the specified criteria and appends the input to the note.

```chute
appendToEvernote(WFInput: Any, WFEvernoteNotesTitleSearch: Text, WFEvernoteWriteMode: Text, WFEvernoteNotesNotebookName: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFEvernoteNotesTitleSearch` | `Text` | — |
| `WFEvernoteWriteMode` | `Text` | `"Append"` |
| `WFEvernoteNotesNotebookName` | `Text` | — |

Shortcuts action: `is.workflow.actions.evernote.append`

## `createDropboxFolder`

Makes a new Dropbox folder.

```chute
createDropboxFolder(WFFilePath: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFilePath` | `Text` | — |

Shortcuts action: `is.workflow.actions.dropbox.createfolder`

## `createNewNote`

Saves the input as a note in Evernote.

```chute
createNewNote(WFEvernoteNoteTitle: Text, WFEvernoteNotebook: Text, WFEvernoteTags: List<Text>, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteNoteTitle` | `Text` | — |
| `WFEvernoteNotebook` | `Text` | — |
| `WFEvernoteTags` | `List<Text>` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.evernote.new`

## `createTrelloBoard`

Creates a new board in your Trello account.

```chute
createTrelloBoard(WFTrelloName: Text, WFTrelloDescription: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | `Text` | — |
| `WFTrelloDescription` | `Text` | — |

Shortcuts action: `is.workflow.actions.trello.add.board`

## `createTrelloList`

Creates a new list on the specified board in your Trello account.

```chute
createTrelloList(WFTrelloName: Text, WFTrelloBoard: Text, WFTrelloPosition: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | `Text` | — |
| `WFTrelloBoard` | `Text` | — |
| `WFTrelloPosition` | `Text` | `"Top"` |

Shortcuts action: `is.workflow.actions.trello.add.list`

## `deleteNotes`

Deletes the notes passed as input from Evernote.

```chute
deleteNotes(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.evernote.delete`

## `getDetailsOfTrelloItem`

```chute
getDetailsOfTrelloItem()
```

Shortcuts action: `is.workflow.actions.properties.trello`

## `getDetailsOfUlyssesSheet`

```chute
getDetailsOfUlyssesSheet()
```

Shortcuts action: `is.workflow.actions.properties.ulysses.sheet`

## `getDropboxFile`

Gets files from Dropbox. Turn off “Show Document Picker” to specify a path to retrieve.

```chute
getDropboxFile(WFShowFilePicker: Boolean, SelectMultiple: Boolean, WFGetFilePath: Text, WFGetFileInitialDirectoryPath: Text, WFFileErrorIfNotFound: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShowFilePicker` | `Boolean` | true |
| `SelectMultiple` | `Boolean` | false |
| `WFGetFilePath` | `Text` | — |
| `WFGetFileInitialDirectoryPath` | `Text` | — |
| `WFFileErrorIfNotFound` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.dropbox.open`

## `getInstapaperBookmarks`

Gets the contents of a folder in Instapaper. Requires Instapaper Premium.

```chute
getInstapaperBookmarks(WFInstapaperFolder: Text, WFBookmarkCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInstapaperFolder` | `Text` | — |
| `WFBookmarkCount` | `Number` | 5 |

Shortcuts action: `is.workflow.actions.instapaper.get`

## `getItemsFromPocket`

Returns items in your Pocket account.

```chute
getItemsFromPocket(WFPocketItemCount: Number, WFPocketItemState: Text, WFPocketItemSearchTerm: Text, WFPocketItemSearchTags: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPocketItemCount` | `Number` | — |
| `WFPocketItemState` | `Text` | `"All"` |
| `WFPocketItemSearchTerm` | `Text` | — |
| `WFPocketItemSearchTags` | `Text` | — |

Shortcuts action: `is.workflow.actions.pocket.get`

## `getNoteLink`

Gets a link to the Evernote note passed into the action, which can be shared.

```chute
getNoteLink(WFEvernoteShareInAppLink: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteShareInAppLink` | `Boolean` | false |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.evernote.getlink`

## `getNotes`

Gets recent notes from Evernote, optionally filtering based on criteria.

```chute
getNotes(WFEvernoteNotesTitleSearch: Text, WFEvernoteNotesTags: List<Text>, WFEvernoteNotesNotebookName: Text, WFEvernoteNotesCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteNotesTitleSearch` | `Text` | — |
| `WFEvernoteNotesTags` | `List<Text>` | — |
| `WFEvernoteNotesNotebookName` | `Text` | — |
| `WFEvernoteNotesCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.evernote.get`

## `getPinboardBookmarks`

Gets bookmarks in your Pinboard account.

```chute
getPinboardBookmarks(WFPinTags: Text, WFBookmarkCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPinTags` | `Text` | — |
| `WFBookmarkCount` | `Number` | 5 |

Shortcuts action: `is.workflow.actions.pinboard.get`

## `getTrelloItems`

Gets cards, lists, or boards in your Trello account.

```chute
getTrelloItems(WFTrelloItemType: Text, WFTrelloBoard: Text, WFTrelloList: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloItemType` | `Text` | `"Boards"` |
| `WFTrelloBoard` | `Text` | — |
| `WFTrelloList` | `Text` | — |

Shortcuts action: `is.workflow.actions.trello.get`

## `importToLightroom`

Imports the photos passed as input into Lightroom.

```chute
importToLightroom(applyPreset: Boolean, presetGroup: Text, preset: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `applyPreset` | `Boolean` | false |
| `presetGroup` | `Text` | `"Color"` |
| `preset` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.lightroom.import`

## `launchapplicationintent`

```chute
launchapplicationintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.LaunchApplicationIntent`

## `launchremoteintent`

```chute
launchremoteintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.LaunchRemoteIntent`

## `openInBlindsquare`

Opens BlindSquare showing information about the place passed as input, so you can save it as a favorite, start tracking it, or start simulation mode.

```chute
openInBlindsquare(WFBlindSquareSimulation: Boolean, WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFBlindSquareSimulation` | `Boolean` | false |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.showinblindsquare`

## `openInGoodreader`

Opens a file in GoodReader.

```chute
openInGoodreader(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.goodreader.open`

## `pausecontentintent`

```chute
pausecontentintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.PauseContentIntent`

## `postToSlack`

Posts the input to the specified Slack channel.

```chute
postToSlack(WFAccount: Text, SlackChannel: Text, WFSlackInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAccount` | `Text` | — |
| `SlackChannel` | `Text` | — |
| `WFSlackInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.slack.send`

## `postToTumblr`

Posts the content passed into the action to Tumblr.

```chute
postToTumblr(WFInput: Any, WFComposeInApp: Boolean, WFBlogName: Text, WFPostType: Text, WFPostState: Text, WFPostTitle: Text, WFPostSource: Text, WFPostCaption: Text, WFPostTags: Text, WFPostDescription: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFComposeInApp` | `Boolean` | — |
| `WFBlogName` | `Text` | — |
| `WFPostType` | `Text` | — |
| `WFPostState` | `Text` | `"Post Now"` |
| `WFPostTitle` | `Text` | — |
| `WFPostSource` | `Text` | — |
| `WFPostCaption` | `Text` | — |
| `WFPostTags` | `Text` | — |
| `WFPostDescription` | `Text` | — |

Shortcuts action: `is.workflow.actions.tumblr.post`

## `postToWordpress`

Posts the input to a WordPress blog as a new post or page.

```chute
postToWordpress(WFAccount: Text, Blog: Text, Title: Text, Type: Text, Format: Text, Status: Text, Categories: Text, Tags: Text, Advanced: Any, AllowComments: Boolean, Slug: Text, Excerpt: Text, Date: Text, Template: Text, ThumbnailImage: Any, ShowCustomFields: Any, CustomFields: Dictionary, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAccount` | `Text` | — |
| `Blog` | `Text` | — |
| `Title` | `Text` | — |
| `Type` | `Text` | — |
| `Format` | `Text` | — |
| `Status` | `Text` | — |
| `Categories` | `Text` | — |
| `Tags` | `Text` | — |
| `Advanced` | `Any` | — |
| `AllowComments` | `Boolean` | — |
| `Slug` | `Text` | — |
| `Excerpt` | `Text` | — |
| `Date` | `Text` | — |
| `Template` | `Text` | — |
| `ThumbnailImage` | `Any` | — |
| `ShowCustomFields` | `Any` | — |
| `CustomFields` | `Dictionary` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.wordpress.post`

## `reduceloudsoundsintent`

```chute
reduceloudsoundsintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.ReduceLoudSoundsIntent`

## `requestPayment`

Requests a payment from the specified people using a payment app on your device.

```chute
requestPayment(IntentAppDefinition: Text, WFVenmoActionRecipients: Text, WFVenmoActionAmount: Number, WFVenmoActionAppSwitch: Boolean, ShowWhenRun: Boolean, WFVenmoActionNote: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `WFVenmoActionRecipients` | `Text` | — |
| `WFVenmoActionAmount` | `Number` | — |
| `WFVenmoActionAppSwitch` | `Boolean` | false |
| `ShowWhenRun` | `Boolean` | true |
| `WFVenmoActionNote` | `Text` | — |

Shortcuts action: `is.workflow.actions.venmo.request`

## `saveDropboxFile`

Save files to Dropbox. Turn off “Ask Where to Save” in order to specify a destination path.

```chute
saveDropboxFile(WFAskWhereToSave: Boolean, WFFileDestinationPath: Text, WFSaveFileOverwrite: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAskWhereToSave` | `Boolean` | true |
| `WFFileDestinationPath` | `Text` | — |
| `WFSaveFileOverwrite` | `Boolean` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.dropbox.savefile`

## `saveWithTransmit`

```chute
saveWithTransmit(TransmitSaveTo: Text, TransmitFavoriteName: Text, TransmitPath: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `TransmitSaveTo` | `Text` | `"Remote"` |
| `TransmitFavoriteName` | `Text` | — |
| `TransmitPath` | `Text` | — |

Shortcuts action: `com.panic.iOS.Transmit.Share`

## `sendPayment`

Sends a payment to the specified people using a payment app on your device.

```chute
sendPayment(IntentAppDefinition: Text, WFVenmoActionRecipients: Text, WFVenmoActionAmount: Number, WFVenmoActionAppSwitch: Boolean, WFVenmoActionNote: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `WFVenmoActionRecipients` | `Text` | — |
| `WFVenmoActionAmount` | `Number` | — |
| `WFVenmoActionAppSwitch` | `Boolean` | false |
| `WFVenmoActionNote` | `Text` | — |

Shortcuts action: `is.workflow.actions.venmo.pay`

## `skipcontentintent`

```chute
skipcontentintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.SkipContentIntent`

## `sleepappletvintent`

```chute
sleepappletvintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.SleepAppleTVIntent`

## `switchuseraccountintent`

```chute
switchuseraccountintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.SwitchUserAccountIntent`

## `togglecaptionsintent`

```chute
togglecaptionsintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.ToggleCaptionsIntent`

## `togglesystemappearanceintent`

```chute
togglesystemappearanceintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.ToggleSystemAppearanceIntent`

## `uploadToCloudapp`

Uploads the input to CloudApp and returns the CloudApp URL.

```chute
uploadToCloudapp(WFCloudAppPrivacyType: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCloudAppPrivacyType` | `Text` | `"Private"` |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.cloudapp.upload`

## `wakeappletvintent`

```chute
wakeappletvintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.WakeAppleTVIntent`
