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
| `IntentAppDefinition` | `Text` | [object Object] |
| `WFCallContact` | `Text` | — |

Shortcuts action: `com.apple.mobilephone.call`

## `contacts`

Passes the specified contacts to the next action.

```chute
contacts(WFContact: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContact` | `Text` | — |

Shortcuts action: `is.workflow.actions.contacts`

## `editContact`

```chute
editContact()
```

Shortcuts action: `is.workflow.actions.setters.contacts`

## `emailAddress`

Passes the specified email addresses to the next action.

```chute
emailAddress(WFEmailAddress: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEmailAddress` | `Text` | — |

Shortcuts action: `is.workflow.actions.email`

## `facetime`

Calls the contact passed in as input using FaceTime.

```chute
facetime(IntentAppDefinition: Text, WFFaceTimeType: Text, WFFaceTimeContact: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `WFFaceTimeType` | `Text` | `"Video"` |
| `WFFaceTimeContact` | `Text` | — |

Shortcuts action: `com.apple.facetime.facetime`

## `findContacts`

```chute
findContacts()
```

Shortcuts action: `is.workflow.actions.filter.contacts`

## `getDetailsOfContacts`

```chute
getDetailsOfContacts()
```

Shortcuts action: `is.workflow.actions.properties.contacts`

## `newContact`

Creates a new contact.

```chute
newContact(WFContactFirstName: Text, WFContactLastName: Text, WFContactCompany: Text, WFContactPhoto: Any, WFContactPhoneNumbers: Text, WFContactEmails: Text, WFContactNotes: Text, ShowWhenRun: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContactFirstName` | `Text` | — |
| `WFContactLastName` | `Text` | — |
| `WFContactCompany` | `Text` | — |
| `WFContactPhoto` | `Any` | — |
| `WFContactPhoneNumbers` | `Text` | — |
| `WFContactEmails` | `Text` | — |
| `WFContactNotes` | `Text` | — |
| `ShowWhenRun` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.addnewcontact`

## `phoneNumber`

Passes the specified phone numbers to the next action.

```chute
phoneNumber(WFPhoneNumber: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPhoneNumber` | `Text` | — |

Shortcuts action: `is.workflow.actions.phonenumber`

## `selectContact`

Prompts to pick a person from your contacts and passes the selection to the next action.

```chute
selectContact(WFSelectMultiple: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSelectMultiple` | `Boolean` | — |

Shortcuts action: `is.workflow.actions.selectcontacts`

## `selectEmailAddress`

Prompts to pick an email address from your contacts and passes the selection to the next action.

```chute
selectEmailAddress() -> Text
```

Shortcuts action: `is.workflow.actions.selectemail`

## `selectPhoneNumber`

Prompts to pick a phone number from your contacts and passes the selection to the next action.

```chute
selectPhoneNumber() -> Text
```

Shortcuts action: `is.workflow.actions.selectphone`
