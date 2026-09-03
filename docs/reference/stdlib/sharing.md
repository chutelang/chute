# Sharing

Sharing content and social media.

```chute
import Sharing;
```

## `airdrop`

Prompts to share the specified content via AirDrop.

```chute
airdrop(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.airdropdocument`

## `postOnFacebook`

Shares the input on Facebook.

```chute
postOnFacebook(FacebookContent: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `FacebookContent` | `Any` | — |

Shortcuts action: `is.workflow.actions.postonfacebook`

## `postToSharedAlbum`

```chute
postToSharedAlbum(ImageInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `ImageInput` | `Any` | — |

Shortcuts action: `com.apple.mobileslideshow.StreamShareService`

## `sendEmail`

Pass text into the action to set the email body. Other types of input are added as attachments.

```chute
sendEmail(WFEmailAccountActionSelectedAccount: Text, WFSendEmailActionFrom: Text, WFSendEmailActionToRecipients: Text, WFSendEmailActionCcRecipients: Text, WFSendEmailActionBccRecipients: Text, WFSendEmailActionSubject: Text, WFSendEmailActionInputAttachments: Text, WFSendEmailActionSaveAsDraft: Boolean, WFSendEmailActionShowComposeSheet: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEmailAccountActionSelectedAccount` | `Text` | — |
| `WFSendEmailActionFrom` | `Text` | — |
| `WFSendEmailActionToRecipients` | `Text` | — |
| `WFSendEmailActionCcRecipients` | `Text` | — |
| `WFSendEmailActionBccRecipients` | `Text` | — |
| `WFSendEmailActionSubject` | `Text` | — |
| `WFSendEmailActionInputAttachments` | `Text` | — |
| `WFSendEmailActionSaveAsDraft` | `Boolean` | — |
| `WFSendEmailActionShowComposeSheet` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.sendemail`

## `sendMessage`

Sends a message. Pass images, videos, or other files as input to include attachments.

```chute
sendMessage(IntentAppDefinition: Text, ShowWhenRun: Boolean, WFSendMessageActionRecipients: Text, WFSendMessageContent: Text, WFSendMessagePrefix: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `ShowWhenRun` | `Boolean` | false |
| `WFSendMessageActionRecipients` | `Text` | — |
| `WFSendMessageContent` | `Text` | — |
| `WFSendMessagePrefix` | `Text` | — |

Shortcuts action: `is.workflow.actions.sendmessage`

## `sendViaDeskconnect`

Sends the input to another device via DeskConnect. DeskConnect makes it easy to send web pages, documents, pictures, and anything else between your devices.

```chute
sendViaDeskconnect(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.deskconnect.send`

## `sendViaMessenger`

Sends the input via Facebook Messenger

```chute
sendViaMessenger()
```

Shortcuts action: `is.workflow.actions.facebook.messenger.send`

## `share`

Prompts to share the specified content.

```chute
share(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.share`

## `shareWithApps`

Prompts to share the specified content using action extensions and sharing extensions provided by other apps.

```chute
shareWithApps(WFInput: Any, WFApp: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFApp` | `Text` | — |

Shortcuts action: `is.workflow.actions.runextension`

## `tweet`

Tweets the input.

```chute
tweet(TweetInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `TweetInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.tweet`

## `uploadToImgur`

Uploads the input to Imgur.

```chute
uploadToImgur(WFInput: Any, WFImgurAnonymous: Boolean, WFImgurDirectLink: Boolean, WFImgurAlbum: Boolean, WFImgurAlbumLayout: Text, WFImgurAlbumPrivacy: Text, WFImgurTitle: Text, WFImgurDescription: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFImgurAnonymous` | `Boolean` | true |
| `WFImgurDirectLink` | `Boolean` | — |
| `WFImgurAlbum` | `Boolean` | false |
| `WFImgurAlbumLayout` | `Text` | `"Blog"` |
| `WFImgurAlbumPrivacy` | `Text` | `"Hidden"` |
| `WFImgurTitle` | `Text` | — |
| `WFImgurDescription` | `Text` | — |

> Powered by Imgur (imgur.com)

Shortcuts action: `is.workflow.actions.imgur.upload`
