# Settings

System toggles and device settings.

```chute
import Settings;
```

## `getHotspotPassword`

Returns the password of your Personal Hotspot.

```chute
getHotspotPassword() -> Text
```

Shortcuts action: `is.workflow.actions.personalhotspot.password.get`

## `setAirdropReceiving`

```chute
setAirdropReceiving(WFAirDropState: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAirDropState` | Text | — |

Shortcuts action: `is.workflow.actions.setairdropreceiving`

## `setAirplaneMode`

Sets the device’s Airplane Mode to on or off.

```chute
setAirplaneMode(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.airplanemode.set`

## `setAlwaysOnDisplay`

Sets the Always On Display setting of your iPhone to on or off.

```chute
setAlwaysOnDisplay(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.display.always-on.set`

## `setAnnounceNotifications`

Sets Announce Notifications to on or off. When on, Siri will announce notifications from new apps that send Time Sensitive notifications or direct messages.

```chute
setAnnounceNotifications(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.announcenotifications.set`

## `setAppearance`

```chute
setAppearance(operation: BooleanSettingOperation, style: DeviceAppearanceType)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `style` | Light \| Dark | — |

Shortcuts action: `is.workflow.actions.appearance`

## `setBluetooth`

Sets the device’s Bluetooth to on or off.

```chute
setBluetooth(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.bluetooth.set`

## `setBrightness`

Sets the device brightness.

```chute
setBrightness(WFBrightness: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFBrightness` | Any | — |

Shortcuts action: `is.workflow.actions.setbrightness`

## `setCellularData`

Sets the device’s Cellular Data to on or off.

```chute
setCellularData(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.cellulardata.set`

## `setFlashlight`

Turns on or off the flashlight near the device's camera.

```chute
setFlashlight(operation: BooleanSettingOperation, state: Boolean, WFFlashlightLevel: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `state` | Boolean | — |
| `WFFlashlightLevel` | Any | — |

Shortcuts action: `is.workflow.actions.flashlight`

## `setHotspotPassword`

Sets the Personal Hotspot password.

```chute
setHotspotPassword(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.personalhotspot.password.set`

## `setLowPowerMode`

```chute
setLowPowerMode(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.lowpowermode.set`

## `setNightShift`

Enables or disables Night Shift. When enabled, the colors of your display will be shifted to the warmer end of the color spectrum after dark. This may help you get a better night’s sleep.

```chute
setNightShift(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.nightshift.set`

## `setNoiseControlMode`

Sets a Noise Control mode on your selected device

```chute
setNoiseControlMode(WFRoute: Text, WFListeningMode: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRoute` | Text | — |
| `WFListeningMode` | Text | — |

Shortcuts action: `is.workflow.actions.listeningmode.set`

## `setOrientationLock`

Turns on or off orientation lock on your device.

```chute
setOrientationLock(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.orientationlock.set`

## `setPersonalHotspot`

Sets the device's Personal Hotspot to on or off.

```chute
setPersonalHotspot(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

> When turning Personal Hotspot on, this action will make the hotspot discoverable for only a short period of time, in order to preserve battery life.

Shortcuts action: `is.workflow.actions.personalhotspot.set`

## `setSilenceUnknownCallers`

Sets Silence Unknown Callers to on or off. When on, calls from unknown numbers will be silenced and sent to voicemail. Calls will still be displayed on the Recents list. Incoming calls will continue to ring from people in your contacts, recent outgoing calls, and Siri Suggestions.

```chute
setSilenceUnknownCallers(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.silenceunknowncallers.set`

## `setStageManager`

Enables or disables Stage Manager on the device.

```chute
setStageManager(operation: BooleanSettingOperation, state: Boolean, showDock: Boolean, showRecentApps: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `state` | Boolean | — |
| `showDock` | Boolean | — |
| `showRecentApps` | Boolean | — |

Shortcuts action: `is.workflow.actions.stagemanager.set`

## `setTrueTone`

Enables or disables True Tone. When enabled, your device display will automatically adapt based on ambient lighting conditions to make colors appear consistent in different environments.

```chute
setTrueTone(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.truetone.set`

## `setVolume`

Sets the volume of the device.

```chute
setVolume(WFVolumeSetting: Enum, WFVolume: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVolumeSetting` | Media \| Ringtone | `"Media"` |
| `WFVolume` | Number | 0.5 |

Shortcuts action: `is.workflow.actions.setvolume`

## `setVpn`

Connects, disconnects or changes the On Demand setting for a VPN Configuration on this device.

```chute
setVpn(WFVPNOperation: Enum, WFOnDemandValue: Boolean, WFVPN: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVPNOperation` | Connect \| Disconnect \| Toggle \| Set On Demand \| Toggle On Demand | `"Connect"` |
| `WFOnDemandValue` | Boolean | true |
| `WFVPN` | Text | — |

> VPN Configurations can be set up in the Settings app. On macOS, you must authenticate as an administrator to change the On Demand setting for a VPN Configuration.

Shortcuts action: `is.workflow.actions.vpn.set`

## `setWiFi`

Sets the device’s Wi-Fi to on or off.

```chute
setWiFi(operation: BooleanSettingOperation, OnValue: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn On \| Turn Off \| Toggle | — |
| `OnValue` | Boolean | — |

Shortcuts action: `is.workflow.actions.wifi.set`
