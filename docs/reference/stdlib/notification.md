# Notification

Alerts, notifications, and banners.

```chute
import Notification;
```

## `showAlert`

Displays an alert with a title, a message, and two buttons. If the user selects the OK button, the shortcut continues. The cancel button stops the shortcut.

```chute
showAlert(WFAlertActionTitle: Text, WFAlertActionMessage: Text, WFAlertActionCancelButtonShown: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAlertActionTitle` | `Text` | — |
| `WFAlertActionMessage` | `Text` | `"Do you want to continue?"` |
| `WFAlertActionCancelButtonShown` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.alert`

## `showContent`

Shows a preview of the provided content. If run from Siri, speaks the provided text.

```chute
showContent(Text: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Text` | `Text` | `""` |

Shortcuts action: `is.workflow.actions.showresult`

## `showContentGraph`

Shows the results of the previous action in the Content Graph.

```chute
showContentGraph(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.viewresult`

## `showNotification`

Displays a local notification.

```chute
showNotification(WFNotificationActionTitle: Text, WFNotificationActionBody: Text, WFNotificationActionSound: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNotificationActionTitle` | `Text` | — |
| `WFNotificationActionBody` | `Text` | — |
| `WFNotificationActionSound` | `Boolean` | true |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.notification`
