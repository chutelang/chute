# Contacts

Contacts, phone calls, and FaceTime.

```chute
import Contacts;
```

## `call`

Calls the phone number passed in as input.

```chute
call(IntentAppDefinition: Text, WFCallContact: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | Text | [object Object] |
| `WFCallContact` | Text | — |

Shortcuts action: `com.apple.mobilephone.call`

## `contacts`

Passes the specified contacts to the next action.

```chute
contacts(WFContact: Text) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContact` | Text | — |

Shortcuts action: `is.workflow.actions.contacts`

## `editContact`

```chute
editContact(WFContentItemPropertyName: Enum, WFPropertyValue: Any) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | First Name \| Middle Name \| Last Name \| Birthday \| Prefix \| Suffix \| Nickname \| Company \| Job Title \| Department \| Email Addresses \| Phone Numbers \| URLs \| Notes \| Street Address \| City \| State \| ZIP Code \| Country \| Has Photo \| Photo \| Group | — |
| `WFPropertyValue` | Any | — |

Shortcuts action: `is.workflow.actions.setters.contacts`

## `emailAddress`

Passes the specified email addresses to the next action.

```chute
emailAddress(WFEmailAddress: Text) -> Email
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEmailAddress` | Text | — |

Shortcuts action: `is.workflow.actions.email`

## `facetime`

Calls the contact passed in as input using FaceTime.

```chute
facetime(IntentAppDefinition: Text, WFFaceTimeType: Enum, WFFaceTimeContact: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | Text | [object Object] |
| `WFFaceTimeType` | Video \| Audio | `"Video"` |
| `WFFaceTimeContact` | Text | — |

Shortcuts action: `com.apple.facetime.facetime`

## `findContacts`

```chute
findContacts(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | First Name \| Middle Name \| Last Name \| Birthday \| Prefix \| Suffix \| Nickname \| Company \| Job Title \| Department \| Email Addresses \| Phone Numbers \| URLs \| Notes \| Street Address \| City \| State \| ZIP Code \| Country \| Has Photo \| Photo \| Group | — |
| `WFContentItemSortOrder` | Latest First \| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.contacts`

## `getDetailsOfContacts`

```chute
getDetailsOfContacts(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | First Name \| Middle Name \| Last Name \| Birthday \| Prefix \| Suffix \| Nickname \| Company \| Job Title \| Department \| Email Addresses \| Phone Numbers \| URLs \| Notes \| Street Address \| City \| State \| ZIP Code \| Country \| Has Photo \| Photo \| Group | — |

Shortcuts action: `is.workflow.actions.properties.contacts`

## `newContact`

Creates a new contact.

```chute
newContact(WFContactFirstName: Text, WFContactLastName: Text, WFContactCompany: Text, WFContactPhoto: Any, WFContactPhoneNumbers: Text, WFContactEmails: Text, WFContactNotes: Text, ShowWhenRun: Boolean) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContactFirstName` | Text | — |
| `WFContactLastName` | Text | — |
| `WFContactCompany` | Text | — |
| `WFContactPhoto` | Any | — |
| `WFContactPhoneNumbers` | Text | — |
| `WFContactEmails` | Text | — |
| `WFContactNotes` | Text | — |
| `ShowWhenRun` | Boolean | true |

Shortcuts action: `is.workflow.actions.addnewcontact`

## `phoneNumber`

Passes the specified phone numbers to the next action.

```chute
phoneNumber(WFPhoneNumber: Text) -> Phone
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPhoneNumber` | Text | — |

Shortcuts action: `is.workflow.actions.phonenumber`

## `selectContact`

Prompts to pick a person from your contacts and passes the selection to the next action.

```chute
selectContact(WFSelectMultiple: Boolean) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSelectMultiple` | Boolean | — |

Shortcuts action: `is.workflow.actions.selectcontacts`

## `selectEmailAddress`

Prompts to pick an email address from your contacts and passes the selection to the next action.

```chute
selectEmailAddress() -> Email
```

Shortcuts action: `is.workflow.actions.selectemail`

## `selectPhoneNumber`

Prompts to pick a phone number from your contacts and passes the selection to the next action.

```chute
selectPhoneNumber() -> Phone
```

Shortcuts action: `is.workflow.actions.selectphone`
