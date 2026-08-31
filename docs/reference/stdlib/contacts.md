# Contacts

Actions for selecting, creating, and calling contacts.

## selectContact

Open the contact picker and let the user choose a contact.

```text
selectContact() -> Text
```

Returns the selected contact.

Shortcuts action: `is.workflow.actions.selectcontact`

## addNewContact

Create a new contact.

```text
addNewContact(firstName: Text, lastName: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `firstName` | `Text` | — | The contact's first name. |
| `lastName` | `Text` | — | The contact's last name. |

Shortcuts action: `is.workflow.actions.addnewcontact`

## phone

Start a phone call.

```text
phone(number: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `number` | `Text` | — | The phone number to call. |

Shortcuts action: `is.workflow.actions.phonecall`
