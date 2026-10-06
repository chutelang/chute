# Calendar

Events and reminders.

```chute
import Calendar;
```

## `addNewCalendar`

Creates a new calendar.

```chute
addNewCalendar(calendarName: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `calendarName` | Text | — |

Shortcuts action: `is.workflow.actions.addnewcalendar`

## `editCalendarEvent`

```chute
editCalendarEvent(property: Enum, value: Any, durationUnit: Enum) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `property` | Duration | — |
| `value` | Any | — |
| `durationUnit` | minutes \\| hours \\| days | — |

```chute
editCalendarEvent(property: Enum, value: Any) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `property` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |
| `value` | Any | — |

Shortcuts action: `is.workflow.actions.setters.calendarevents`

## `editReminder`

```chute
editReminder(property: Enum, value: Any, priorityLevel: Enum) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `property` | Priority | — |
| `value` | Any | — |
| `priorityLevel` | None \\| Low \\| Medium \\| High | — |

```chute
editReminder(property: Enum, value: Any) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `property` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Notes \\| Creation Date \\| Last Modified Date | — |
| `value` | Any | — |

Shortcuts action: `is.workflow.actions.setters.reminders`

## `filterEventAttendees`

```chute
filterEventAttendees(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> EventAttendee
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Name \\| Email Address \\| Is Me \\| Role \\| Status | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.eventattendees`

## `findCalendarEvents`

```chute
findCalendarEvents(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Duration \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.calendarevents`

## `findReminders`

```chute
findReminders(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Priority \\| Notes \\| Creation Date \\| Last Modified Date | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.reminders`

## `getDetailsOfCalendarEvents`

```chute
getDetailsOfCalendarEvents(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Duration \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |

Shortcuts action: `is.workflow.actions.properties.calendarevents`

## `getDetailsOfEventAttendees`

```chute
getDetailsOfEventAttendees(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Email Address \\| Is Me \\| Role \\| Status | — |

Shortcuts action: `is.workflow.actions.properties.eventattendees`

## `getDetailsOfReminders`

```chute
getDetailsOfReminders(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Priority \\| Notes \\| Creation Date \\| Last Modified Date | — |

Shortcuts action: `is.workflow.actions.properties.reminders`

## `getUpcomingEvents`

Gets upcoming calendar events, ordered from nearest to farthest away in time.

```chute
getUpcomingEvents(calendar: Text, WFGetUpcomingItemCount: Number, day: Enum, specifiedDay: Text) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `calendar` | Text | — |
| `WFGetUpcomingItemCount` | Number | 1 |
| `day` | Any Day \\| Today \\| Tomorrow \\| Specified Day | `"Any Day"` |
| `specifiedDay` | Text | — |

Shortcuts action: `is.workflow.actions.getupcomingevents`

## `getUpcomingReminders`

Gets upcoming reminders, ordered from nearest to farthest away due date.

```chute
getUpcomingReminders(list: Text, WFGetUpcomingItemCount: Number) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `list` | Text | — |
| `WFGetUpcomingItemCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getupcomingreminders`

## `newEvent`

Creates a new event and adds it to the selected calendar.

```chute
newEvent(title: Text, location: Text, calendar: Text, startDate: Text, endDate: Text, allDay: Boolean, alert: Enum, alertTime: Text, notes: Text, showComposeSheet: Boolean) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `title` | Text | — |
| `location` | Text | — |
| `calendar` | Text | — |
| `startDate` | Text | — |
| `endDate` | Text | — |
| `allDay` | Boolean | — |
| `alert` | None \\| At time of event \\| 5 minutes before \\| 15 minutes before \\| 30 minutes before \\| 1 hour before \\| 2 hours before \\| 1 day before \\| 2 days before \\| 1 week before \\| Custom | — |
| `alertTime` | Text | — |
| `notes` | Text | — |
| `showComposeSheet` | Boolean | true |

Shortcuts action: `is.workflow.actions.addnewevent`

## `newReminder`

Creates a new reminder and adds it to the selected list of reminders.

```chute
newReminder(reminder: Text, list: Text, alert: Enum, trigger: Enum, location: Text, person: Text, radius: Number, time: Text, priority: Enum, urgent: Boolean, flag: Boolean, url: Text, images: Image, parentReminder: Reminder, tags: Text, notes: Text) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `reminder` | Text | — |
| `list` | Text | — |
| `alert` | No Alert \\| Alert | `"No Alert"` |
| `trigger` | At Time \\| When I Arrive \\| When I Leave \\| When Messaging | `"At Time"` |
| `location` | Text | — |
| `person` | Text | — |
| `radius` | Number | 1000 |
| `time` | Text | — |
| `priority` | None \\| Low \\| Medium \\| High | `"None"` |
| `urgent` | Boolean | — |
| `flag` | Boolean | — |
| `url` | Text | — |
| `images` | Image | — |
| `parentReminder` | Reminder | — |
| `tags` | Text | — |
| `notes` | Text | — |

Shortcuts action: `is.workflow.actions.addnewreminder`

## `openInCalendar`

Shows the date or calendar event passed as input in the Calendar app.

```chute
openInCalendar(event: CalendarEvent)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `event` | CalendarEvent | — |

Shortcuts action: `is.workflow.actions.showincalendar`

## `openRemindersList`

Shows the specified list in the Reminders app.

```chute
openRemindersList(list: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `list` | Text | — |

Shortcuts action: `is.workflow.actions.reminders.showlist`

## `removeEvents`

Removes all events passed into the action from the calendars they are contained in.

```chute
removeEvents(includeFutureEvents: Boolean, events: CalendarEvent)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `includeFutureEvents` | Boolean | false |
| `events` | CalendarEvent | — |

> This is a destructive and permanent action. You will be asked to confirm before events are removed.

Shortcuts action: `is.workflow.actions.removeevents`

## `removeReminders`

Removes all reminders passed into the action from the lists they are contained in.

```chute
removeReminders(reminders: Reminder)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `reminders` | Reminder | — |

> This is a destructive and permanent action. You will be asked to confirm before reminders are removed.

Shortcuts action: `is.workflow.actions.removereminders`

## `showQuickReminder`

Opens the Quick Reminder view.

```chute
showQuickReminder()
```

Shortcuts action: `is.workflow.actions.addquickreminder`
