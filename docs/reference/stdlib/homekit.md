# HomeKit

Home automation.

```chute
import HomeKit;
```

## `controlHome`

Set the state of your home.

```chute
controlHome(WFHome: Text, WFHomeTriggerActionSets: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHome` | `Text` | — |
| `WFHomeTriggerActionSets` | `Text` | — |

Shortcuts action: `is.workflow.actions.homeaccessory`

## `getState`

Gets the state of a Home accessory.

```chute
getState(WFHome: Text, WFHMService: Text, WFHMCharacteristic: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHome` | `Text` | — |
| `WFHMService` | `Text` | — |
| `WFHMCharacteristic` | `Text` | — |

Shortcuts action: `is.workflow.actions.gethomeaccessorystate`

## `intercom`

Announces a message passed as input using Intercom.

```chute
intercom(WFHome: Text, WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHome` | `Text` | — |
| `WFInput` | `Text` | — |

> This action accepts both text and media files as input. Media files will be broadcast as they are. When text is provided, it will be first converted to audio using the current Siri language and voice. You can also use the Make Spoken Audio From Text action to customize the voice parameters.

Shortcuts action: `is.workflow.actions.intercom`
