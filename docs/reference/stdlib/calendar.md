# Calendar

Events and reminders.

```chute
import Calendar;
```

## `addNewCalendar`

Creates a new calendar.

```chute
addNewCalendar(CalendarName: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `CalendarName` | `Text` | — |

Shortcuts action: `is.workflow.actions.addnewcalendar`

## `editCalendarEvent`

```chute
editCalendarEvent()
```

Shortcuts action: `is.workflow.actions.setters.calendarevents`

## `editReminder`

```chute
editReminder()
```

Shortcuts action: `is.workflow.actions.setters.reminders`

## `filterEventAttendees`

```chute
filterEventAttendees()
```

Shortcuts action: `is.workflow.actions.filter.eventattendees`

## `findCalendarEvents`

```chute
findCalendarEvents()
```

Shortcuts action: `is.workflow.actions.filter.calendarevents`

## `findReminders`

```chute
findReminders()
```

Shortcuts action: `is.workflow.actions.filter.reminders`

## `getDetailsOfCalendarEvents`

```chute
getDetailsOfCalendarEvents()
```

Shortcuts action: `is.workflow.actions.properties.calendarevents`

## `getDetailsOfEventAttendees`

```chute
getDetailsOfEventAttendees()
```

Shortcuts action: `is.workflow.actions.properties.eventattendees`

## `getDetailsOfReminders`

```chute
getDetailsOfReminders()
```

Shortcuts action: `is.workflow.actions.properties.reminders`

## `getUpcomingEvents`

Gets upcoming calendar events, ordered from nearest to farthest away in time.

```chute
getUpcomingEvents(WFGetUpcomingItemCalendar: Text, WFGetUpcomingItemCount: Number, WFDateSpecifier: Text, WFSpecifiedDate: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetUpcomingItemCalendar` | `Text` | — |
| `WFGetUpcomingItemCount` | `Number` | 1 |
| `WFDateSpecifier` | `Text` | `"Any Day"` |
| `WFSpecifiedDate` | `Text` | — |

Shortcuts action: `is.workflow.actions.getupcomingevents`

## `getUpcomingReminders`

Gets upcoming reminders, ordered from nearest to farthest away due date.

```chute
getUpcomingReminders(WFGetUpcomingItemCalendar: Text, WFGetUpcomingItemCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetUpcomingItemCalendar` | `Text` | — |
| `WFGetUpcomingItemCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.getupcomingreminders`

## `newEvent`

Creates a new event and adds it to the selected calendar.

```chute
newEvent(WFCalendarItemTitle: Text, WFCalendarItemLocation: Text, WFCalendarDescriptor: Text, WFCalendarItemStartDate: Text, WFCalendarItemEndDate: Text, WFCalendarItemAllDay: Boolean, WFAlertTime: Text, WFAlertCustomTime: Text, WFCalendarItemNotes: Text, ShowWhenRun: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarItemTitle` | `Text` | — |
| `WFCalendarItemLocation` | `Text` | — |
| `WFCalendarDescriptor` | `Text` | — |
| `WFCalendarItemStartDate` | `Text` | — |
| `WFCalendarItemEndDate` | `Text` | — |
| `WFCalendarItemAllDay` | `Boolean` | — |
| `WFAlertTime` | `Text` | — |
| `WFAlertCustomTime` | `Text` | — |
| `WFCalendarItemNotes` | `Text` | — |
| `ShowWhenRun` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.addnewevent`

## `newReminder`

Creates a new reminder and adds it to the selected list of reminders.

```chute
newReminder(WFCalendarItemTitle: Text, WFCalendarDescriptor: Text, WFAlertEnabled: Text, WFAlertCondition: Text, WFAlertLocation: Text, WFAlertPerson: Text, WFAlertLocationRadius: Number, WFAlertCustomTime: Text, WFPriority: Text, WFUrgent: Boolean, WFFlag: Boolean, WFURL: Text, WFImages: Any, WFParentTask: Any, WFTags: Text, WFCalendarItemNotes: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarItemTitle` | `Text` | — |
| `WFCalendarDescriptor` | `Text` | — |
| `WFAlertEnabled` | `Text` | `"No Alert"` |
| `WFAlertCondition` | `Text` | `"At Time"` |
| `WFAlertLocation` | `Text` | — |
| `WFAlertPerson` | `Text` | — |
| `WFAlertLocationRadius` | `Number` | 1000 |
| `WFAlertCustomTime` | `Text` | — |
| `WFPriority` | `Text` | `"None"` |
| `WFUrgent` | `Boolean` | — |
| `WFFlag` | `Boolean` | — |
| `WFURL` | `Text` | — |
| `WFImages` | `Any` | — |
| `WFParentTask` | `Any` | — |
| `WFTags` | `Text` | — |
| `WFCalendarItemNotes` | `Text` | — |

Shortcuts action: `is.workflow.actions.addnewreminder`

## `openInCalendar`

Shows the date or calendar event passed as input in the Calendar app.

```chute
openInCalendar(WFEvent: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvent` | `Any` | — |

Shortcuts action: `is.workflow.actions.showincalendar`

## `openRemindersList`

Shows the specified list in the Reminders app.

```chute
openRemindersList(WFList: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFList` | `Text` | — |

Shortcuts action: `is.workflow.actions.reminders.showlist`

## `removeEvents`

Removes all events passed into the action from the calendars they are contained in.

```chute
removeEvents(WFCalendarIncludeFutureEvents: Boolean, WFInputEvents: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarIncludeFutureEvents` | `Boolean` | false |
| `WFInputEvents` | `Any` | — |

> This is a destructive and permanent action. You will be asked to confirm before events are removed.

Shortcuts action: `is.workflow.actions.removeevents`

## `removeReminders`

Removes all reminders passed into the action from the lists they are contained in.

```chute
removeReminders(WFInputReminders: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputReminders` | `Any` | — |

> This is a destructive and permanent action. You will be asked to confirm before reminders are removed.

Shortcuts action: `is.workflow.actions.removereminders`

## `showQuickReminder`

Opens the Quick Reminder view.

```chute
showQuickReminder()
```

Shortcuts action: `is.workflow.actions.addquickreminder`
