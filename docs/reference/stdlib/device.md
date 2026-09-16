# Device

Device details, clipboard, appearance, and focus modes.

```chute
import Device;
```

## `connectToServers`

Connects your computer to the specified file servers on the network. For example, you can connect to SMB/CIFS, NFS, FTP (read-only), or WebDAV servers.

```chute
connectToServers(Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.connecttoservers`

## `copyToClipboard`

Copies the result of the last action to the clipboard.

```chute
copyToClipboard(Boolean, Text, Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLocalOnly` | Boolean | false |
| `WFExpirationDate` | Text | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.setclipboard`

## `ejectDisk`

This action ejects a mounted disk or volume.

```chute
ejectDisk(Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.ejectdisk`

## `findDisplays`

```chute
findDisplays()
```

Shortcuts action: `is.workflow.actions.filter.displays`

## `findWindows`

```chute
findWindows()
```

Shortcuts action: `is.workflow.actions.filter.windows`

## `getAllWallpapers`

Gets all of your Lock Screen wallpapers, and returns them as output so you can use them with other actions.

```chute
getAllWallpapers(Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPosterType` | All \| Current | `"All"` |

Shortcuts action: `is.workflow.actions.posters.get`

## `getBatteryStatus`

Returns information about the battery and any charger connected to the device.

```chute
getBatteryStatus(Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Subject` | Battery Level \| Is Charging \| Is Connected to Charger \| Charge Limit | `"Battery Level"` |

> You can use this action to fetch the current battery percentage, whether your device is plugged into a charger or is charging, or get the current battery charge limit if one is enabled.

Shortcuts action: `is.workflow.actions.getbatterylevel`

## `getClipboard`

Passes the contents of the clipboard to the next action.

```chute
getClipboard() -> Any
```

Shortcuts action: `is.workflow.actions.getclipboard`

## `getCurrentApp`

Gets the current visible app.

```chute
getCurrentApp(Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVisibleAppScope` | Current \| Visible | `"Current"` |

Shortcuts action: `is.workflow.actions.getcurrentapp`

## `getCurrentFocus`

Returns the currently active Focus.

```chute
getCurrentFocus() -> Any
```

> This action returns nothing if no Focus is active.

Shortcuts action: `is.workflow.actions.dnd.getfocus`

## `getCurrentIpAddress`

Returns the local or external IP address of the device.

```chute
getCurrentIpAddress(Enum, Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFIPAddressSourceOption` | External \| Local | `"External"` |
| `WFIPAddressTypeOption` | IPv4 \| IPv6 | `"IPv4"` |

Shortcuts action: `is.workflow.actions.getipaddress`

## `getDetailsOfAppearance`

```chute
getDetailsOfAppearance()
```

Shortcuts action: `is.workflow.actions.properties.appearance`

## `getDeviceDetails`

Gets information about the current device.

```chute
getDeviceDetails(Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDeviceDetail` | Device Name \| Device Hostname \| Device Model \| Device Is Watch \| System Version \| System Build Number \| Screen Width \| Screen Height \| Current Volume \| Current Brightness \| Current Appearance \| Device Is Locked | `"Device Name"` |

Shortcuts action: `is.workflow.actions.getdevicedetails`

## `getNetworkDetails`

Gets information about the currently connected networks.

```chute
getNetworkDetails(Text, Enum, Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNetworkDetailsNetwork` | Text | — |
| `WFWiFiDetail` | Network Name \| BSSID \| Wi-Fi Standard \| RX Rate \| TX Rate \| RSSI \| Noise \| Channel Number \| Hardware MAC Address | `"Network Name"` |
| `WFCellularDetail` | Carrier Name \| Radio Technology \| Country Code \| Is Roaming Abroad \| Number of Signal Bars | `"Carrier Name"` |

Shortcuts action: `is.workflow.actions.getwifi`

## `getWhat’sOnScreen`

Gets the current content on screen, if available.

```chute
getWhat’sOnScreen() -> Any
```

Shortcuts action: `is.workflow.actions.getonscreencontent`

## `goToHomeScreen`

Navigates to the Home Screen.

```chute
goToHomeScreen()
```

Shortcuts action: `is.workflow.actions.returntohomescreen`

## `hideApp`

Hides one or all open applications. You can choose a list of apps to keep open.

```chute
hideApp(Enum, Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHideAppMode` | App \| All Apps | `"App"` |
| `WFApp` | Text | — |
| `WFAppsExcept` | Text | — |

Shortcuts action: `is.workflow.actions.hide.app`

## `lockApp`

Changes whether the selected application is locked. Locked apps require authentication to access.

```chute
lockApp(Enum, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLockAppOperation` | Lock \| Unlock \| Toggle | `"Lock"` |
| `WFApp` | Text | — |

Shortcuts action: `is.workflow.actions.lock.app`

## `lockScreen`

Locks the screen of this device.

```chute
lockScreen()
```

Shortcuts action: `is.workflow.actions.lockscreen`

## `logOutUser`

Logs out the current user.

```chute
logOutUser()
```

Shortcuts action: `is.workflow.actions.logout`

## `moveWindow`

Moves one or more windows to the specified location.

```chute
moveWindow(Enum, Number, Number, Any, Boolean, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPosition` | Top Left \| Top Center \| Top Right \| Middle Left \| Center \| Middle Right \| Bottom Left \| Bottom Center \| Bottom Right \| Coordinates | `"Center"` |
| `WFXCoordinate` | Number | — |
| `WFYCoordinate` | Number | — |
| `WFWindow` | Any | — |
| `WFBringToFront` | Boolean | true |
| `Display` | Text | — |

Shortcuts action: `is.workflow.actions.movewindow`

## `mtcreatealarmintent`

```chute
mtcreatealarmintent()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTCreateAlarmIntent`

## `mtgetalarmsintent`

```chute
mtgetalarmsintent()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTGetAlarmsIntent`

## `mttogglealarmintent`

```chute
mttogglealarmintent()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTToggleAlarmIntent`

## `putDisplayToSleep`

Puts the display(s) of this Mac to sleep.

```chute
putDisplayToSleep()
```

Shortcuts action: `is.workflow.actions.displaysleep`

## `quitApp`

Quits one or all open applications. You can choose a list of apps to keep open.

```chute
quitApp(Enum, Text, Text, Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFQuitAppMode` | App \| All Apps | `"App"` |
| `WFAppsExcept` | Text | — |
| `WFApp` | Text | — |
| `WFAskToSaveChanges` | Boolean | true |

Shortcuts action: `is.workflow.actions.quit.app`

## `resizeWindow`

Resizes one or more windows to the specified width and height.

```chute
resizeWindow(Enum, Number, Number, Any, Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFConfiguration` | Fit Screen \| Top Half \| Bottom Half \| Left Half \| Right Half \| Top Left Quarter \| Top Right Quarter \| Bottom Left Quarter \| Bottom Right Quarter \| Dimensions | `"Fit Screen"` |
| `WFWidth` | Number | — |
| `WFHeight` | Number | — |
| `WFWindow` | Any | — |
| `WFBringToFront` | Boolean | true |

Shortcuts action: `is.workflow.actions.resizewindow`

## `search`

Searches for content in the system that matches the specified text.

```chute
search(Text, Text, Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputText` | Text | — |
| `WFSpotlightSearchResultType` | Text | `"All"` |
| `WFSpotlightSearchLimit` | Number | 5 |

Shortcuts action: `is.workflow.actions.spotlightsearch`

## `searchInPasswords`

Opens Passwords and searches for the given text.

```chute
searchInPasswords(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShowPasswordsSearchTerm` | Text | — |

Shortcuts action: `is.workflow.actions.openpasswords`

## `setFocus`

Sets the specified Focus on or off.

```chute
setFocus(Enum, Boolean, Enum, Any, Text, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Operation` | Turn \| Toggle | `"Turn"` |
| `Enabled` | Boolean | false |
| `AssertionType` | Turned Off \| Time \| I Leave \| Event Ends | `"Turned Off"` |
| `Event` | Any | — |
| `Time` | Text | — |
| `FocusModes` | Text | — |

Shortcuts action: `is.workflow.actions.dnd.set`

## `setWallpaperPhoto`

Sets the wallpaper to the specified image.

```chute
setWallpaperPhoto(Any, Enum, Boolean, Boolean, Text, Boolean, Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Any | — |
| `WFWallpaperLocation` | Lock Screen \| Home Screen | Lock Screen,Home Screen |
| `WFWallpaperShowPreview` | Boolean | true |
| `WFWallpaperPerspectiveZoom` | Boolean | false |
| `WFSelectedPoster` | Text | — |
| `WFWallpaperSmartCrop` | Boolean | true |
| `WFWallpaperLegibilityBlur` | Boolean | true |

Shortcuts action: `is.workflow.actions.wallpaper.set`

## `shutDown`

Shuts down or restarts your device.

```chute
shutDown(Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShutdownMode` | Shut Down \| Restart | `"Shut Down"` |

Shortcuts action: `is.workflow.actions.reboot`

## `sleep`

Put this Mac to sleep.

```chute
sleep()
```

Shortcuts action: `is.workflow.actions.sleep`

## `splitScreenApps`

Open the specified apps in split screen mode.

```chute
splitScreenApps(Text, Text, Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPrimaryAppIdentifier` | Text | — |
| `WFSecondaryAppIdentifier` | Text | — |
| `WFAppRatio` | ½ + ½ \| ⅔ + ⅓ | `"½ + ½"` |

Shortcuts action: `is.workflow.actions.splitscreen`

## `startScreenSaver`

Starts the screen saver selected in the Desktop & Screen Saver preference pane.

```chute
startScreenSaver()
```

Shortcuts action: `is.workflow.actions.startscreensaver`

## `startTimer`

Starts a timer in the Clock app for the specified amount of time.

```chute
startTimer(Text, Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | Text | [object Object] |
| `WFDuration` | Number | — |

Shortcuts action: `is.workflow.actions.timer.start`

## `switchBetweenWallpapers`

Switches the current Lock Screen wallpaper.

```chute
switchBetweenWallpapers(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPoster` | Text | — |

> If the wallpaper has a linked Focus, this action will set the Focus, too.

Shortcuts action: `is.workflow.actions.posters.switch`

## `takeScreenshot`

Take a screenshot of the device's screen.

```chute
takeScreenshot(Enum, Enum, Boolean, Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTakeScreenshotScreenshotType` | Full Screen \| Interactive | `"Full Screen"` |
| `WFTakeScreenshotActionInteractiveSelectionType` | Window \| Custom | `"Window"` |
| `WFTakeScreenshotMainMonitorOnly` | Boolean | false |
| `WFTakeScreenshotIgnoreContextualAssistanceLayers` | Boolean | false |

Shortcuts action: `is.workflow.actions.takescreenshot`

## `vibrateDevice`

Vibrates the device for a short amount of time.

```chute
vibrateDevice(Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVibrateHapticType` | Default \| Up Direction \| Down Direction \| Success \| Failure \| Retry \| Start \| Stop \| Click | `"Default"` |

Shortcuts action: `is.workflow.actions.vibrate`

## `watchMeDo`

Records and plays back mouse and keyboard events.

```chute
watchMeDo(Any, Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFUserEvent` | Any | — |
| `WFPlaybackSpeed` | Number | 1 |

Shortcuts action: `is.workflow.actions.watchmedo`
