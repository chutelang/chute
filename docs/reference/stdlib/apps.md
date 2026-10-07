# Apps

App-specific integrations.

```chute
import Apps;
```

## `addTodoistItem`

Adds a new item to Todoist.

```chute
addTodoistItem(item: Text, project: Text, dueDate: Text, remindMeOn: Text, reminderType: Enum, priority: Enum, notes: Text, files: File) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `item` | Text | — |
| `project` | Text | `"Inbox"` |
| `dueDate` | Text | — |
| `remindMeOn` | Text | — |
| `reminderType` | Email \\| Push Notification \\| Text Message | `"Email"` |
| `priority` | 4 \\| 3 \\| 2 \\| 1 | `"4"` |
| `notes` | Text | — |
| `files` | File | — |

Shortcuts action: `is.workflow.actions.todoist.add`

## `addToInstapaper`

Adds the input to Instapaper.

```chute
addToInstapaper(folder: Text, url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `folder` | Text | — |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.instapaper.add`

## `addToPinboard`

Adds the URL passed into the action to your Pinboard.

```chute
addToPinboard(title: Text, tags: Text, public: Boolean, unread: Boolean, description: Text, url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `title` | Text | — |
| `tags` | Text | — |
| `public` | Boolean | true |
| `unread` | Boolean | true |
| `description` | Text | — |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.pinboard.add`

## `addToPocket`

Adds the input to Pocket.

```chute
addToPocket(tags: Text, url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `tags` | Text | — |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.pocket.add`

## `addTrelloCard`

Creates a new card on the specified list and board in your Trello account.

```chute
addTrelloCard(item: Text, board: Text, list: Text, due: Text, position: Enum, attachments: File, description: Text) -> TrelloItem
```

| Parameter | Type | Default |
| --- | --- | --- |
| `item` | Text | — |
| `board` | Text | — |
| `list` | Text | — |
| `due` | Text | — |
| `position` | Top \\| Bottom | `"Top"` |
| `attachments` | File | — |
| `description` | Text | — |

Shortcuts action: `is.workflow.actions.trello.add.card`

## `appendToDropboxTextFile`

Adds the text passed as input to the end of the specified file.

```chute
appendToDropboxTextFile(filePath: Text, mode: Enum, makeNewLine: Boolean, text: Text) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `filePath` | Text | — |
| `mode` | Append \\| Prepend | `"Append"` |
| `makeNewLine` | Boolean | true |
| `text` | Text | — |

> If no file exists yet at the specified path, a new file will be created. Make sure to include a file extension (usually .txt) at the end of your path.

Shortcuts action: `is.workflow.actions.dropbox.appendfile`

## `appendToEvernote`

Finds a note using the specified criteria and appends the input to the note.

```chute
appendToEvernote(content: Any, noteTitle: Text, mode: Enum, inNotebook: Text) -> EvernoteNote
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |
| `noteTitle` | Text | — |
| `mode` | Append \\| Prepend | `"Append"` |
| `inNotebook` | Text | — |

Shortcuts action: `is.workflow.actions.evernote.append`

## `createDropboxFolder`

Makes a new Dropbox folder.

```chute
createDropboxFolder(path: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `path` | Text | — |

Shortcuts action: `is.workflow.actions.dropbox.createfolder`

## `createEvernoteNote`

Saves the input as a note in Evernote.

```chute
createEvernoteNote(noteTitle: Text, notebook: Text, tags: List<Text>, content: Any) -> EvernoteNote
```

| Parameter | Type | Default |
| --- | --- | --- |
| `noteTitle` | Text | — |
| `notebook` | Text | — |
| `tags` | List&lt;Text&gt; | — |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.evernote.new`

## `createTrelloBoard`

Creates a new board in your Trello account.

```chute
createTrelloBoard(name: Text, description: Text) -> TrelloItem
```

| Parameter | Type | Default |
| --- | --- | --- |
| `name` | Text | — |
| `description` | Text | — |

Shortcuts action: `is.workflow.actions.trello.add.board`

## `createTrelloList`

Creates a new list on the specified board in your Trello account.

```chute
createTrelloList(name: Text, board: Text, position: Enum) -> TrelloItem
```

| Parameter | Type | Default |
| --- | --- | --- |
| `name` | Text | — |
| `board` | Text | — |
| `position` | Top \\| Bottom | `"Top"` |

Shortcuts action: `is.workflow.actions.trello.add.list`

## `deleteEvernoteNotes`

Deletes the notes passed as input from Evernote.

```chute
deleteEvernoteNotes(notes: EvernoteNote)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `notes` | EvernoteNote | — |

Shortcuts action: `is.workflow.actions.evernote.delete`

## `getDetailsOfTrelloItem`

```chute
getDetailsOfTrelloItem() -> Any
```

Shortcuts action: `is.workflow.actions.properties.trello`

## `getDetailsOfUlyssesSheet`

```chute
getDetailsOfUlyssesSheet() -> Any
```

Shortcuts action: `is.workflow.actions.properties.ulysses.sheet`

## `getDropboxFile`

Gets files from Dropbox. Turn off “Show Document Picker” to specify a path to retrieve.

```chute
getDropboxFile(showDocumentPicker: Boolean, selectMultiple: Boolean, filePath: Text, initialPath: Text, errorIfNotFound: Boolean) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `showDocumentPicker` | Boolean | true |
| `selectMultiple` | Boolean | false |
| `filePath` | Text | — |
| `initialPath` | Text | — |
| `errorIfNotFound` | Boolean | true |

Shortcuts action: `is.workflow.actions.dropbox.open`

## `getEvernoteNoteLink`

Gets a link to the Evernote note passed into the action, which can be shared.

```chute
getEvernoteNoteLink(inAppLink: Boolean, note: EvernoteNote) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `inAppLink` | Boolean | false |
| `note` | EvernoteNote | — |

Shortcuts action: `is.workflow.actions.evernote.getlink`

## `getEvernoteNotes`

Gets recent notes from Evernote, optionally filtering based on criteria.

```chute
getEvernoteNotes(titleSearch: Text, tags: List<Text>, inNotebook: Text, WFEvernoteNotesCount: Number) -> EvernoteNote
```

| Parameter | Type | Default |
| --- | --- | --- |
| `titleSearch` | Text | — |
| `tags` | List&lt;Text&gt; | — |
| `inNotebook` | Text | — |
| `WFEvernoteNotesCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.evernote.get`

## `getInstapaperBookmarks`

Gets the contents of a folder in Instapaper. Requires Instapaper Premium.

```chute
getInstapaperBookmarks(folder: Text, WFBookmarkCount: Number) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `folder` | Text | — |
| `WFBookmarkCount` | Number | 5 |

Shortcuts action: `is.workflow.actions.instapaper.get`

## `getItemsFromPocket`

Returns items in your Pocket account.

```chute
getItemsFromPocket(WFPocketItemCount: Number, type: Enum, search: Text, tag: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPocketItemCount` | Number | — |
| `type` | Unread \\| Archived \\| All | `"All"` |
| `search` | Text | — |
| `tag` | Text | — |

Shortcuts action: `is.workflow.actions.pocket.get`

## `getPinboardBookmarks`

Gets bookmarks in your Pinboard account.

```chute
getPinboardBookmarks(tags: Text, WFBookmarkCount: Number) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `tags` | Text | — |
| `WFBookmarkCount` | Number | 5 |

Shortcuts action: `is.workflow.actions.pinboard.get`

## `getTrelloItems`

Gets cards, lists, or boards in your Trello account.

```chute
getTrelloItems(get: Enum, board: Text, list: Text) -> TrelloItem
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Boards \\| Lists \\| Cards | `"Boards"` |
| `board` | Text | — |
| `list` | Text | — |

Shortcuts action: `is.workflow.actions.trello.get`

## `importToLightroom`

Imports the photos passed as input into Lightroom.

```chute
importToLightroom(applyPreset: Boolean, presetGroup: Enum, preset: Text, photos: Image)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `applyPreset` | Boolean | false |
| `presetGroup` | B&W \\| Color \\| Creative \\| Curve \\| Grain \\| Sharpening \\| Vignetting | `"Color"` |
| `preset` | Text | — |
| `photos` | Image | — |

Shortcuts action: `is.workflow.actions.lightroom.import`

## `launchAppleTvApp`

```chute
launchAppleTvApp()
```

Shortcuts action: `com.apple.TVRemoteUIService.LaunchApplicationIntent`

## `launchAppleTvRemote`

```chute
launchAppleTvRemote()
```

Shortcuts action: `com.apple.TVRemoteUIService.LaunchRemoteIntent`

## `openInBlindsquare`

Opens BlindSquare showing information about the place passed as input, so you can save it as a favorite, start tracking it, or start simulation mode.

```chute
openInBlindsquare(startSimulation: Boolean, location: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `startSimulation` | Boolean | false |
| `location` | Text | — |

Shortcuts action: `is.workflow.actions.showinblindsquare`

## `openInGoodreader`

Opens a file in GoodReader.

```chute
openInGoodreader(file: File)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.goodreader.open`

## `pauseAppleTv`

```chute
pauseAppleTv()
```

Shortcuts action: `com.apple.TVRemoteUIService.PauseContentIntent`

## `postToSlack`

Posts the input to the specified Slack channel.

```chute
postToSlack(account: Text, channel: Text, content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `account` | Text | — |
| `channel` | Text | — |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.slack.send`

## `postToTumblr`

Posts the content passed into the action to Tumblr.

```chute
postToTumblr(content: Any, composeInTumblr: Boolean, blog: Text, type: Text, postStatus: Enum, title: Text, source: Text, caption: Text, tags: Text, description: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |
| `composeInTumblr` | Boolean | — |
| `blog` | Text | — |
| `type` | Text | — |
| `postStatus` | Post Now \\| Add to Queue \\| Save as Draft \\| Post Privately | `"Post Now"` |
| `title` | Text | — |
| `source` | Text | — |
| `caption` | Text | — |
| `tags` | Text | — |
| `description` | Text | — |

Shortcuts action: `is.workflow.actions.tumblr.post`

## `postToWordpress`

Posts the input to a WordPress blog as a new post or page.

```chute
postToWordpress(account: Text, blog: Text, title: Text, type: Text, format: Text, status: Text, categories: Text, tags: Text, advanced: Any, allowComments: Boolean, slug: Text, excerpt: Text, publishDate: Text, template: Text, featuredImage: Image, ShowCustomFields: Any, CustomFields: Dictionary, content: Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `account` | Text | — |
| `blog` | Text | — |
| `title` | Text | — |
| `type` | Text | — |
| `format` | Text | — |
| `status` | Text | — |
| `categories` | Text | — |
| `tags` | Text | — |
| `advanced` | Any | — |
| `allowComments` | Boolean | — |
| `slug` | Text | — |
| `excerpt` | Text | — |
| `publishDate` | Text | — |
| `template` | Text | — |
| `featuredImage` | Image | — |
| `ShowCustomFields` | Any | — |
| `CustomFields` | Dictionary | — |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.wordpress.post`

## `reduceLoudSounds`

```chute
reduceLoudSounds()
```

Shortcuts action: `com.apple.TVRemoteUIService.ReduceLoudSoundsIntent`

## `requestPayment`

Requests a payment from the specified people using a payment app on your device.

```chute
requestPayment(recipients: Text, amount: Number, openInApp: Boolean, note: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `recipients` | Text | — |
| `amount` | Number | — |
| `openInApp` | Boolean | false |
| `note` | Text | — |

Shortcuts action: `is.workflow.actions.venmo.request`

## `saveDropboxFile`

Save files to Dropbox. Turn off “Ask Where to Save” in order to specify a destination path.

```chute
saveDropboxFile(askWhereToSave: Boolean, destinationPath: Text, replaceExistingFiles: Boolean, file: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `askWhereToSave` | Boolean | true |
| `destinationPath` | Text | — |
| `replaceExistingFiles` | Boolean | — |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.dropbox.savefile`

## `saveWithTransmit`

```chute
saveWithTransmit(saveTo: Enum, favoriteName: Text, path: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `saveTo` | Local \\| Remote | `"Remote"` |
| `favoriteName` | Text | — |
| `path` | Text | — |

Shortcuts action: `com.panic.iOS.Transmit.Share`

## `sendPayment`

Sends a payment to the specified people using a payment app on your device.

```chute
sendPayment(recipients: Text, amount: Number, openInApp: Boolean, note: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `recipients` | Text | — |
| `amount` | Number | — |
| `openInApp` | Boolean | false |
| `note` | Text | — |

Shortcuts action: `is.workflow.actions.venmo.pay`

## `skipAppleTvContent`

```chute
skipAppleTvContent()
```

Shortcuts action: `com.apple.TVRemoteUIService.SkipContentIntent`

## `sleepAppleTv`

```chute
sleepAppleTv()
```

Shortcuts action: `com.apple.TVRemoteUIService.SleepAppleTVIntent`

## `switchAppleTvUser`

```chute
switchAppleTvUser()
```

Shortcuts action: `com.apple.TVRemoteUIService.SwitchUserAccountIntent`

## `toggleAppleTvAppearance`

```chute
toggleAppleTvAppearance()
```

Shortcuts action: `com.apple.TVRemoteUIService.ToggleSystemAppearanceIntent`

## `toggleCaptions`

```chute
toggleCaptions()
```

Shortcuts action: `com.apple.TVRemoteUIService.ToggleCaptionsIntent`

## `uploadToCloudapp`

Uploads the input to CloudApp and returns the CloudApp URL.

```chute
uploadToCloudapp(linkPrivacy: Enum, content: Any) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `linkPrivacy` | Private \\| Public | `"Private"` |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.cloudapp.upload`

## `wakeAppleTv`

```chute
wakeAppleTv()
```

Shortcuts action: `com.apple.TVRemoteUIService.WakeAppleTVIntent`
