# Sharing

Sharing content and social media.

```chute
import Sharing;
```

## `airdrop`

Prompts to share the specified content via AirDrop.

```chute
airdrop(content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.airdropdocument`

## `postOnFacebook`

Shares the input on Facebook.

```chute
postOnFacebook(content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.postonfacebook`

## `postToSharedAlbum`

```chute
postToSharedAlbum(images: Image)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `images` | Image | — |

Shortcuts action: `com.apple.mobileslideshow.StreamShareService`

## `sendEmail`

Pass text into the action to set the email body. Other types of input are added as attachments.

```chute
sendEmail(WFEmailAccountActionSelectedAccount: Text, WFSendEmailActionFrom: Text, recipients: Text, cc: Text, bcc: Text, subject: Text, message: Text, saveAsDraft: Boolean, showComposeSheet: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEmailAccountActionSelectedAccount` | Text | — |
| `WFSendEmailActionFrom` | Text | — |
| `recipients` | Text | — |
| `cc` | Text | — |
| `bcc` | Text | — |
| `subject` | Text | — |
| `message` | Text | — |
| `saveAsDraft` | Boolean | — |
| `showComposeSheet` | Boolean | true |

Shortcuts action: `is.workflow.actions.sendemail`

## `sendMessage`

Sends a message. Pass images, videos, or other files as input to include attachments.

```chute
sendMessage(recipients: Text, message: Text, prefix: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `recipients` | Text | — |
| `message` | Text | — |
| `prefix` | Text | — |

Shortcuts action: `is.workflow.actions.sendmessage`

## `sendViaDeskconnect`

Sends the input to another device via DeskConnect. DeskConnect makes it easy to send web pages, documents, pictures, and anything else between your devices.

```chute
sendViaDeskconnect(content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |

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
share(content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.share`

## `shareWithApps`

Prompts to share the specified content using action extensions and sharing extensions provided by other apps.

```chute
shareWithApps(content: Any, app: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Any | — |
| `app` | Text | — |

Shortcuts action: `is.workflow.actions.runextension`

## `tweet`

Tweets the input.

```chute
tweet(tweet: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `tweet` | Text | — |

Shortcuts action: `is.workflow.actions.tweet`

## `uploadToImgur`

Uploads the input to Imgur.

```chute
uploadToImgur(images: Image, uploadAnonymously: Boolean, directLink: Boolean, createAlbum: Boolean, albumLayout: Enum, albumPrivacy: Enum, title: Text, description: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `images` | Image | — |
| `uploadAnonymously` | Boolean | true |
| `directLink` | Boolean | — |
| `createAlbum` | Boolean | false |
| `albumLayout` | Blog \\| Grid \\| Horizontal \\| Vertical | `"Blog"` |
| `albumPrivacy` | Public \\| Hidden \\| Secret | `"Hidden"` |
| `title` | Text | — |
| `description` | Text | — |

> Powered by Imgur (imgur.com)

Shortcuts action: `is.workflow.actions.imgur.upload`
