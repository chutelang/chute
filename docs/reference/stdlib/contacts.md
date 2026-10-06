# Contacts

Contacts, phone calls, and FaceTime.

```chute
import Contacts;
```

## `call`

Calls the phone number passed in as input.

```chute
call(app: Text, contact: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | [object Object] |
| `contact` | Text | — |

Shortcuts action: `com.apple.mobilephone.call`

## `contacts`

Passes the specified contacts to the next action.

```chute
contacts(contact: Text) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `contact` | Text | — |

Shortcuts action: `is.workflow.actions.contacts`

## `editContact`

```chute
editContact(property: Enum, value: Any) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `property` | First Name \\| Middle Name \\| Last Name \\| Birthday \\| Prefix \\| Suffix \\| Nickname \\| Company \\| Job Title \\| Department \\| Email Addresses \\| Phone Numbers \\| URLs \\| Notes \\| Street Address \\| City \\| State \\| ZIP Code \\| Country \\| Has Photo \\| Photo \\| Group | — |
| `value` | Any | — |

Shortcuts action: `is.workflow.actions.setters.contacts`

## `emailAddress`

Passes the specified email addresses to the next action.

```chute
emailAddress(emailAddress: Text) -> Email
```

| Parameter | Type | Default |
| --- | --- | --- |
| `emailAddress` | Text | — |

Shortcuts action: `is.workflow.actions.email`

## `facetime`

Calls the contact passed in as input using FaceTime.

```chute
facetime(app: Text, callType: Enum, contact: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | [object Object] |
| `callType` | Video \\| Audio | `"Video"` |
| `contact` | Text | — |

Shortcuts action: `com.apple.facetime.facetime`

## `findContacts`

```chute
findContacts(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | First Name \\| Middle Name \\| Last Name \\| Birthday \\| Prefix \\| Suffix \\| Nickname \\| Company \\| Job Title \\| Department \\| Email Addresses \\| Phone Numbers \\| URLs \\| Notes \\| Street Address \\| City \\| State \\| ZIP Code \\| Country \\| Has Photo \\| Photo \\| Group | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.contacts`

## `getDetailsOfContacts`

```chute
getDetailsOfContacts(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | First Name \\| Middle Name \\| Last Name \\| Birthday \\| Prefix \\| Suffix \\| Nickname \\| Company \\| Job Title \\| Department \\| Email Addresses \\| Phone Numbers \\| URLs \\| Notes \\| Street Address \\| City \\| State \\| ZIP Code \\| Country \\| Has Photo \\| Photo \\| Group | — |

Shortcuts action: `is.workflow.actions.properties.contacts`

## `newContact`

Creates a new contact.

```chute
newContact(firstName: Text, lastName: Text, company: Text, photo: Image, phoneNumber: Text, emailAddress: Text, notes: Text, showComposeSheet: Boolean) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `firstName` | Text | — |
| `lastName` | Text | — |
| `company` | Text | — |
| `photo` | Image | — |
| `phoneNumber` | Text | — |
| `emailAddress` | Text | — |
| `notes` | Text | — |
| `showComposeSheet` | Boolean | true |

Shortcuts action: `is.workflow.actions.addnewcontact`

## `phoneNumber`

Passes the specified phone numbers to the next action.

```chute
phoneNumber(phoneNumber: Text) -> Phone
```

| Parameter | Type | Default |
| --- | --- | --- |
| `phoneNumber` | Text | — |

Shortcuts action: `is.workflow.actions.phonenumber`

## `selectContact`

Prompts to pick a person from your contacts and passes the selection to the next action.

```chute
selectContact(selectMultiple: Boolean) -> Contact
```

| Parameter | Type | Default |
| --- | --- | --- |
| `selectMultiple` | Boolean | — |

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
