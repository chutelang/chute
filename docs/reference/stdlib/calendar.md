# Calendar

Actions for creating and retrieving calendar events and reminders.

## `addNewEvent`

Create a new calendar event.

```text
addNewEvent(title: Text, start: Text, end: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Text` | None | The event title. |
| `start` | `Text` | None | The start date and time. |
| `end` | `Text` | None | The end date and time. |

Shortcuts action: `is.workflow.actions.addnewcalendar`

## `getUpcomingEvents`

Get upcoming calendar events.

```text
getUpcomingEvents(count: Number = 1) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `Number` | `1` | The number of events to retrieve. |

Returns a list of upcoming events.

Shortcuts action: `is.workflow.actions.getupcomingevents`

## `addNewReminder`

Create a new reminder.

```text
addNewReminder(title: Text, list: Text = "Reminders")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `Text` | None | The reminder title. |
| `list` | `Text` | `"Reminders"` | The reminder list to add to. |

Shortcuts action: `is.workflow.actions.addnewreminder`

## `getUpcomingReminders`

Get upcoming reminders.

```text
getUpcomingReminders(count: Number = 1) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `Number` | `1` | The number of reminders to retrieve. |

Returns a list of upcoming reminders.

Shortcuts action: `is.workflow.actions.getupcomingreminders`
