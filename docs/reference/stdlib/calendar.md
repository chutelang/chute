# Calendar

Events and reminders.

```chute
import Calendar;
```

## `addNewCalendar`

Creates a new calendar.

```chute
addNewCalendar(CalendarName: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `CalendarName` | Text | — |

Shortcuts action: `is.workflow.actions.addnewcalendar`

## `editCalendarEvent`

```chute
editCalendarEvent(WFContentItemPropertyName: Enum, WFPropertyValue: Any, WFDurationUnit: Enum) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Duration | — |
| `WFPropertyValue` | Any | — |
| `WFDurationUnit` | minutes \\| hours \\| days | — |

```chute
editCalendarEvent(WFContentItemPropertyName: Enum, WFPropertyValue: Any) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |
| `WFPropertyValue` | Any | — |

Shortcuts action: `is.workflow.actions.setters.calendarevents`

## `editReminder`

```chute
editReminder(WFContentItemPropertyName: Enum, WFPropertyValue: Any, WFPriorityLevel: Enum) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Priority | — |
| `WFPropertyValue` | Any | — |
| `WFPriorityLevel` | None \\| Low \\| Medium \\| High | — |

```chute
editReminder(WFContentItemPropertyName: Enum, WFPropertyValue: Any) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Notes \\| Creation Date \\| Last Modified Date | — |
| `WFPropertyValue` | Any | — |

Shortcuts action: `is.workflow.actions.setters.reminders`

## `filterEventAttendees`

```chute
filterEventAttendees(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> EventAttendee
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Name \\| Email Address \\| Is Me \\| Role \\| Status | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.eventattendees`

## `findCalendarEvents`

```chute
findCalendarEvents(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Duration \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.calendarevents`

## `findReminders`

```chute
findReminders(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Priority \\| Notes \\| Creation Date \\| Last Modified Date | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.reminders`

## `getDetailsOfCalendarEvents`

```chute
getDetailsOfCalendarEvents(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Title \\| Location \\| Start Date \\| End Date \\| Calendar \\| Is All Day \\| Notes \\| URL \\| Has Alarms \\| Duration \\| Attendees \\| Organizer \\| Creation Date \\| Last Modified Date \\| Time Zone | — |

Shortcuts action: `is.workflow.actions.properties.calendarevents`

## `getDetailsOfEventAttendees`

```chute
getDetailsOfEventAttendees(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Name \\| Email Address \\| Is Me \\| Role \\| Status | — |

Shortcuts action: `is.workflow.actions.properties.eventattendees`

## `getDetailsOfReminders`

```chute
getDetailsOfReminders(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Title \\| Is Completed \\| Completion Date \\| Due Date \\| Reminder List \\| Has Alarms \\| Priority \\| Notes \\| Creation Date \\| Last Modified Date | — |

Shortcuts action: `is.workflow.actions.properties.reminders`

## `getUpcomingEvents`

Gets upcoming calendar events, ordered from nearest to farthest away in time.

```chute
getUpcomingEvents(WFGetUpcomingItemCalendar: Text, WFGetUpcomingItemCount: Number, WFDateSpecifier: Enum, WFSpecifiedDate: Text) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetUpcomingItemCalendar` | Text | — |
| `WFGetUpcomingItemCount` | Number | 1 |
| `WFDateSpecifier` | Any Day \\| Today \\| Tomorrow \\| Specified Day | `"Any Day"` |
| `WFSpecifiedDate` | Text | — |

Shortcuts action: `is.workflow.actions.getupcomingevents`

## `getUpcomingReminders`

Gets upcoming reminders, ordered from nearest to farthest away due date.

```chute
getUpcomingReminders(WFGetUpcomingItemCalendar: Text, WFGetUpcomingItemCount: Number) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetUpcomingItemCalendar` | Text | — |
| `WFGetUpcomingItemCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getupcomingreminders`

## `newEvent`

Creates a new event and adds it to the selected calendar.

```chute
newEvent(WFCalendarItemTitle: Text, WFCalendarItemLocation: Text, WFCalendarDescriptor: Text, WFCalendarItemStartDate: Text, WFCalendarItemEndDate: Text, WFCalendarItemAllDay: Boolean, WFAlertTime: Enum, WFAlertCustomTime: Text, WFCalendarItemNotes: Text, ShowWhenRun: Boolean) -> CalendarEvent
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarItemTitle` | Text | — |
| `WFCalendarItemLocation` | Text | — |
| `WFCalendarDescriptor` | Text | — |
| `WFCalendarItemStartDate` | Text | — |
| `WFCalendarItemEndDate` | Text | — |
| `WFCalendarItemAllDay` | Boolean | — |
| `WFAlertTime` | None \\| At time of event \\| 5 minutes before \\| 15 minutes before \\| 30 minutes before \\| 1 hour before \\| 2 hours before \\| 1 day before \\| 2 days before \\| 1 week before \\| Custom | — |
| `WFAlertCustomTime` | Text | — |
| `WFCalendarItemNotes` | Text | — |
| `ShowWhenRun` | Boolean | true |

Shortcuts action: `is.workflow.actions.addnewevent`

## `newReminder`

Creates a new reminder and adds it to the selected list of reminders.

```chute
newReminder(WFCalendarItemTitle: Text, WFCalendarDescriptor: Text, WFAlertEnabled: Enum, WFAlertCondition: Enum, WFAlertLocation: Text, WFAlertPerson: Text, WFAlertLocationRadius: Number, WFAlertCustomTime: Text, WFPriority: Enum, WFUrgent: Boolean, WFFlag: Boolean, WFURL: Text, WFImages: Image, WFParentTask: Reminder, WFTags: Text, WFCalendarItemNotes: Text) -> Reminder
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarItemTitle` | Text | — |
| `WFCalendarDescriptor` | Text | — |
| `WFAlertEnabled` | No Alert \\| Alert | `"No Alert"` |
| `WFAlertCondition` | At Time \\| When I Arrive \\| When I Leave \\| When Messaging | `"At Time"` |
| `WFAlertLocation` | Text | — |
| `WFAlertPerson` | Text | — |
| `WFAlertLocationRadius` | Number | 1000 |
| `WFAlertCustomTime` | Text | — |
| `WFPriority` | None \\| Low \\| Medium \\| High | `"None"` |
| `WFUrgent` | Boolean | — |
| `WFFlag` | Boolean | — |
| `WFURL` | Text | — |
| `WFImages` | Image | — |
| `WFParentTask` | Reminder | — |
| `WFTags` | Text | — |
| `WFCalendarItemNotes` | Text | — |

Shortcuts action: `is.workflow.actions.addnewreminder`

## `openInCalendar`

Shows the date or calendar event passed as input in the Calendar app.

```chute
openInCalendar(WFEvent: CalendarEvent)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEvent` | CalendarEvent | — |

Shortcuts action: `is.workflow.actions.showincalendar`

## `openRemindersList`

Shows the specified list in the Reminders app.

```chute
openRemindersList(WFList: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFList` | Text | — |

Shortcuts action: `is.workflow.actions.reminders.showlist`

## `removeEvents`

Removes all events passed into the action from the calendars they are contained in.

```chute
removeEvents(WFCalendarIncludeFutureEvents: Boolean, WFInputEvents: CalendarEvent)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCalendarIncludeFutureEvents` | Boolean | false |
| `WFInputEvents` | CalendarEvent | — |

> This is a destructive and permanent action. You will be asked to confirm before events are removed.

Shortcuts action: `is.workflow.actions.removeevents`

## `removeReminders`

Removes all reminders passed into the action from the lists they are contained in.

```chute
removeReminders(WFInputReminders: Reminder)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputReminders` | Reminder | — |

> This is a destructive and permanent action. You will be asked to confirm before reminders are removed.

Shortcuts action: `is.workflow.actions.removereminders`

## `showQuickReminder`

Opens the Quick Reminder view.

```chute
showQuickReminder()
```

Shortcuts action: `is.workflow.actions.addquickreminder`
