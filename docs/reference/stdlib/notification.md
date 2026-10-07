# Notification

Alerts, notifications, and banners.

```chute
import Notification;
```

## `showAlert`

Displays an alert with a title, a message, and two buttons. If the user selects the OK button, the shortcut continues. The cancel button stops the shortcut.

```chute
showAlert(message: Text, title: Text, showCancelButton: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `message` | Text | `"Do you want to continue?"` |
| `title` | Text | — |
| `showCancelButton` | Boolean | true |

Shortcuts action: `is.workflow.actions.alert`

## `showNotification`

Displays a local notification.

```chute
showNotification(title: Text, body: Text, playSound: Boolean, attachment: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `title` | Text | — |
| `body` | Text | — |
| `playSound` | Boolean | true |
| `attachment` | Any | — |

Shortcuts action: `is.workflow.actions.notification`

## `showResult`

Shows a preview of the provided content. If run from Siri, speaks the provided text.

```chute
showResult(content: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `content` | Text | `""` |

Shortcuts action: `is.workflow.actions.showresult`

## `viewContentGraph`

Shows the results of the previous action in the Content Graph.

```chute
viewContentGraph(input: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.viewresult`
