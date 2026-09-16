# Apps

App-specific integrations.

```chute
import Apps;
```

## `addTodoistItem`

Adds a new item to Todoist.

```chute
addTodoistItem(Text, Text, Text, Text, Enum, Enum, Text, Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTodoistContent` | Text | — |
| `WFTodoistProject` | Text | `"Inbox"` |
| `WFTodoistDueDate` | Text | — |
| `WFTodoistReminder` | Text | — |
| `WFTodoistReminderType` | Email \| Push Notification \| Text Message | `"Email"` |
| `WFTodoistPriority` | 4 \| 3 \| 2 \| 1 | `"4"` |
| `WFTodoistNotes` | Text | — |
| `WFTodoistFile` | Any | — |

Shortcuts action: `is.workflow.actions.todoist.add`

## `addToInstapaper`

Adds the input to Instapaper.

```chute
addToInstapaper(Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInstapaperFolder` | Text | — |
| `WFInputURL` | Text | — |

Shortcuts action: `is.workflow.actions.instapaper.add`

## `addToPinboard`

Adds the URL passed into the action to your Pinboard.

```chute
addToPinboard(Text, Text, Boolean, Boolean, Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPinTitle` | Text | — |
| `WFPinTags` | Text | — |
| `WFPinPublic` | Boolean | true |
| `WFPinUnread` | Boolean | true |
| `WFPinDescription` | Text | — |
| `WFPinboardURL` | Text | — |

Shortcuts action: `is.workflow.actions.pinboard.add`

## `addToPocket`

Adds the input to Pocket.

```chute
addToPocket(Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPocketTags` | Text | — |
| `WFInputURL` | Text | — |

Shortcuts action: `is.workflow.actions.pocket.add`

## `addTrelloCard`

Creates a new card on the specified list and board in your Trello account.

```chute
addTrelloCard(Text, Text, Text, Text, Enum, Any, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | Text | — |
| `WFTrelloBoard` | Text | — |
| `WFTrelloList` | Text | — |
| `WFTrelloDueDate` | Text | — |
| `WFTrelloCardPosition` | Top \| Bottom | `"Top"` |
| `WFTrelloAttachments` | Any | — |
| `WFTrelloDescription` | Text | — |

Shortcuts action: `is.workflow.actions.trello.add.card`

## `appendToDropboxTextFile`

Adds the text passed as input to the end of the specified file.

```chute
appendToDropboxTextFile(Text, Enum, Boolean, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFilePath` | Text | — |
| `WFAppendFileWriteMode` | Append \| Prepend | `"Append"` |
| `WFAppendOnNewLine` | Boolean | true |
| `WFInput` | Text | — |

> If no file exists yet at the specified path, a new file will be created. Make sure to include a file extension (usually .txt) at the end of your path.

Shortcuts action: `is.workflow.actions.dropbox.appendfile`

## `appendToEvernote`

Finds a note using the specified criteria and appends the input to the note.

```chute
appendToEvernote(Any, Text, Enum, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |
| `WFEvernoteNotesTitleSearch` | Text | — |
| `WFEvernoteWriteMode` | Append \| Prepend | `"Append"` |
| `WFEvernoteNotesNotebookName` | Text | — |

Shortcuts action: `is.workflow.actions.evernote.append`

## `createDropboxFolder`

Makes a new Dropbox folder.

```chute
createDropboxFolder(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFilePath` | Text | — |

Shortcuts action: `is.workflow.actions.dropbox.createfolder`

## `createNewNote`

Saves the input as a note in Evernote.

```chute
createNewNote(Text, Text, List&lt;Text&gt;, Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteNoteTitle` | Text | — |
| `WFEvernoteNotebook` | Text | — |
| `WFEvernoteTags` | List&lt;Text&gt; | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.evernote.new`

## `createTrelloBoard`

Creates a new board in your Trello account.

```chute
createTrelloBoard(Text, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | Text | — |
| `WFTrelloDescription` | Text | — |

Shortcuts action: `is.workflow.actions.trello.add.board`

## `createTrelloList`

Creates a new list on the specified board in your Trello account.

```chute
createTrelloList(Text, Text, Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloName` | Text | — |
| `WFTrelloBoard` | Text | — |
| `WFTrelloPosition` | Top \| Bottom | `"Top"` |

Shortcuts action: `is.workflow.actions.trello.add.list`

## `deleteNotes`

Deletes the notes passed as input from Evernote.

```chute
deleteNotes(Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |

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
getDropboxFile(Boolean, Boolean, Text, Text, Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShowFilePicker` | Boolean | true |
| `SelectMultiple` | Boolean | false |
| `WFGetFilePath` | Text | — |
| `WFGetFileInitialDirectoryPath` | Text | — |
| `WFFileErrorIfNotFound` | Boolean | true |

Shortcuts action: `is.workflow.actions.dropbox.open`

## `getInstapaperBookmarks`

Gets the contents of a folder in Instapaper. Requires Instapaper Premium.

```chute
getInstapaperBookmarks(Text, Number) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInstapaperFolder` | Text | — |
| `WFBookmarkCount` | Number | 5 |

Shortcuts action: `is.workflow.actions.instapaper.get`

## `getItemsFromPocket`

Returns items in your Pocket account.

```chute
getItemsFromPocket(Number, Enum, Text, Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPocketItemCount` | Number | — |
| `WFPocketItemState` | Unread \| Archived \| All | `"All"` |
| `WFPocketItemSearchTerm` | Text | — |
| `WFPocketItemSearchTags` | Text | — |

Shortcuts action: `is.workflow.actions.pocket.get`

## `getNoteLink`

Gets a link to the Evernote note passed into the action, which can be shared.

```chute
getNoteLink(Boolean, Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteShareInAppLink` | Boolean | false |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.evernote.getlink`

## `getNotes`

Gets recent notes from Evernote, optionally filtering based on criteria.

```chute
getNotes(Text, List&lt;Text&gt;, Text, Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvernoteNotesTitleSearch` | Text | — |
| `WFEvernoteNotesTags` | List&lt;Text&gt; | — |
| `WFEvernoteNotesNotebookName` | Text | — |
| `WFEvernoteNotesCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.evernote.get`

## `getPinboardBookmarks`

Gets bookmarks in your Pinboard account.

```chute
getPinboardBookmarks(Text, Number) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPinTags` | Text | — |
| `WFBookmarkCount` | Number | 5 |

Shortcuts action: `is.workflow.actions.pinboard.get`

## `getTrelloItems`

Gets cards, lists, or boards in your Trello account.

```chute
getTrelloItems(Enum, Text, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTrelloItemType` | Boards \| Lists \| Cards | `"Boards"` |
| `WFTrelloBoard` | Text | — |
| `WFTrelloList` | Text | — |

Shortcuts action: `is.workflow.actions.trello.get`

## `importToLightroom`

Imports the photos passed as input into Lightroom.

```chute
importToLightroom(Boolean, Enum, Text, Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `applyPreset` | Boolean | false |
| `presetGroup` | B&W \| Color \| Creative \| Curve \| Grain \| Sharpening \| Vignetting | `"Color"` |
| `preset` | Text | — |
| `WFInput` | Any | — |

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
openInBlindsquare(Boolean, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFBlindSquareSimulation` | Boolean | false |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.showinblindsquare`

## `openInGoodreader`

Opens a file in GoodReader.

```chute
openInGoodreader(Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.goodreader.open`

## `pausecontentintent`

```chute
pausecontentintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.PauseContentIntent`

## `postToSlack`

Posts the input to the specified Slack channel.

```chute
postToSlack(Text, Text, Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAccount` | Text | — |
| `SlackChannel` | Text | — |
| `WFSlackInput` | Any | — |

Shortcuts action: `is.workflow.actions.slack.send`

## `postToTumblr`

Posts the content passed into the action to Tumblr.

```chute
postToTumblr(Any, Boolean, Text, Text, Enum, Text, Text, Text, Text, Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |
| `WFComposeInApp` | Boolean | — |
| `WFBlogName` | Text | — |
| `WFPostType` | Text | — |
| `WFPostState` | Post Now \| Add to Queue \| Save as Draft \| Post Privately | `"Post Now"` |
| `WFPostTitle` | Text | — |
| `WFPostSource` | Text | — |
| `WFPostCaption` | Text | — |
| `WFPostTags` | Text | — |
| `WFPostDescription` | Text | — |

Shortcuts action: `is.workflow.actions.tumblr.post`

## `postToWordpress`

Posts the input to a WordPress blog as a new post or page.

```chute
postToWordpress(Text, Text, Text, Text, Text, Text, Text, Text, Any, Boolean, Text, Text, Text, Text, Any, Any, Dictionary, Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAccount` | Text | — |
| `Blog` | Text | — |
| `Title` | Text | — |
| `Type` | Text | — |
| `Format` | Text | — |
| `Status` | Text | — |
| `Categories` | Text | — |
| `Tags` | Text | — |
| `Advanced` | Any | — |
| `AllowComments` | Boolean | — |
| `Slug` | Text | — |
| `Excerpt` | Text | — |
| `Date` | Text | — |
| `Template` | Text | — |
| `ThumbnailImage` | Any | — |
| `ShowCustomFields` | Any | — |
| `CustomFields` | Dictionary | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.wordpress.post`

## `reduceloudsoundsintent`

```chute
reduceloudsoundsintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.ReduceLoudSoundsIntent`

## `requestPayment`

Requests a payment from the specified people using a payment app on your device.

```chute
requestPayment(Text, Text, Number, Boolean, Boolean, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | Text | [object Object] |
| `WFVenmoActionRecipients` | Text | — |
| `WFVenmoActionAmount` | Number | — |
| `WFVenmoActionAppSwitch` | Boolean | false |
| `ShowWhenRun` | Boolean | true |
| `WFVenmoActionNote` | Text | — |

Shortcuts action: `is.workflow.actions.venmo.request`

## `saveDropboxFile`

Save files to Dropbox. Turn off “Ask Where to Save” in order to specify a destination path.

```chute
saveDropboxFile(Boolean, Text, Boolean, Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAskWhereToSave` | Boolean | true |
| `WFFileDestinationPath` | Text | — |
| `WFSaveFileOverwrite` | Boolean | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.dropbox.savefile`

## `saveWithTransmit`

```chute
saveWithTransmit(Enum, Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `TransmitSaveTo` | Local \| Remote | `"Remote"` |
| `TransmitFavoriteName` | Text | — |
| `TransmitPath` | Text | — |

Shortcuts action: `com.panic.iOS.Transmit.Share`

## `sendPayment`

Sends a payment to the specified people using a payment app on your device.

```chute
sendPayment(Text, Text, Number, Boolean, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | Text | [object Object] |
| `WFVenmoActionRecipients` | Text | — |
| `WFVenmoActionAmount` | Number | — |
| `WFVenmoActionAppSwitch` | Boolean | false |
| `WFVenmoActionNote` | Text | — |

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
uploadToCloudapp(Enum, Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCloudAppPrivacyType` | Private \| Public | `"Private"` |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.cloudapp.upload`

## `wakeappletvintent`

```chute
wakeappletvintent()
```

Shortcuts action: `com.apple.TVRemoteUIService.WakeAppleTVIntent`
