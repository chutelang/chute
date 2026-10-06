# HomeKit

Home automation.

```chute
import HomeKit;
```

## `controlHome`

Set the state of your home.

```chute
controlHome(home: Text, scenesAndAccessories: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `home` | Text | — |
| `scenesAndAccessories` | Text | — |

Shortcuts action: `is.workflow.actions.homeaccessory`

## `getState`

Gets the state of a Home accessory.

```chute
getState(home: Text, accessoryState: Text, characteristic: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `home` | Text | — |
| `accessoryState` | Text | — |
| `characteristic` | Text | — |

Shortcuts action: `is.workflow.actions.gethomeaccessorystate`

## `intercom`

Announces a message passed as input using Intercom.

```chute
intercom(home: Text, message: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `home` | Text | — |
| `message` | Text | — |

> This action accepts both text and media files as input. Media files will be broadcast as they are. When text is provided, it will be first converted to audio using the current Siri language and voice. You can also use the Make Spoken Audio From Text action to customize the voice parameters.

Shortcuts action: `is.workflow.actions.intercom`
