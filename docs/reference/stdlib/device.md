# Device

Device details, clipboard, appearance, and focus modes.

```chute
import Device;
```

## `connectToServers`

Connects your computer to the specified file servers on the network. For example, you can connect to SMB/CIFS, NFS, FTP (read-only), or WebDAV servers.

```chute
connectToServers(WFInput: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.connecttoservers`

## `copyToClipboard`

Copies the result of the last action to the clipboard.

```chute
copyToClipboard(WFLocalOnly: Boolean, WFExpirationDate: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLocalOnly` | `Boolean` | false |
| `WFExpirationDate` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.setclipboard`

## `ejectDisk`

This action ejects a mounted disk or volume.

```chute
ejectDisk(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

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
getAllWallpapers(WFPosterType: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPosterType` | `Text` | `"All"` |

Shortcuts action: `is.workflow.actions.posters.get`

## `getBatteryStatus`

Returns information about the battery and any charger connected to the device.

```chute
getBatteryStatus(Subject: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Subject` | `Text` | `"Battery Level"` |

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
getCurrentApp(WFVisibleAppScope: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVisibleAppScope` | `Text` | `"Current"` |

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
getCurrentIpAddress(WFIPAddressSourceOption: Text, WFIPAddressTypeOption: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFIPAddressSourceOption` | `Text` | `"External"` |
| `WFIPAddressTypeOption` | `Text` | `"IPv4"` |

Shortcuts action: `is.workflow.actions.getipaddress`

## `getDetailsOfAppearance`

```chute
getDetailsOfAppearance()
```

Shortcuts action: `is.workflow.actions.properties.appearance`

## `getDeviceDetails`

Gets information about the current device.

```chute
getDeviceDetails(WFDeviceDetail: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDeviceDetail` | `Text` | `"Device Name"` |

Shortcuts action: `is.workflow.actions.getdevicedetails`

## `getNetworkDetails`

Gets information about the currently connected networks.

```chute
getNetworkDetails(WFNetworkDetailsNetwork: Text, WFWiFiDetail: Text, WFCellularDetail: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNetworkDetailsNetwork` | `Text` | — |
| `WFWiFiDetail` | `Text` | `"Network Name"` |
| `WFCellularDetail` | `Text` | `"Carrier Name"` |

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
hideApp(WFHideAppMode: Text, WFApp: Text, WFAppsExcept: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHideAppMode` | `Text` | `"App"` |
| `WFApp` | `Text` | — |
| `WFAppsExcept` | `Text` | — |

Shortcuts action: `is.workflow.actions.hide.app`

## `lockApp`

Changes whether the selected application is locked. Locked apps require authentication to access.

```chute
lockApp(WFLockAppOperation: Text, WFApp: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLockAppOperation` | `Text` | `"Lock"` |
| `WFApp` | `Text` | — |

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
moveWindow(WFPosition: Text, WFXCoordinate: Number, WFYCoordinate: Number, WFWindow: Any, WFBringToFront: Boolean, Display: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPosition` | `Text` | `"Center"` |
| `WFXCoordinate` | `Number` | — |
| `WFYCoordinate` | `Number` | — |
| `WFWindow` | `Any` | — |
| `WFBringToFront` | `Boolean` | true |
| `Display` | `Text` | — |

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
quitApp(WFQuitAppMode: Text, WFAppsExcept: Text, WFApp: Text, WFAskToSaveChanges: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFQuitAppMode` | `Text` | `"App"` |
| `WFAppsExcept` | `Text` | — |
| `WFApp` | `Text` | — |
| `WFAskToSaveChanges` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.quit.app`

## `resizeWindow`

Resizes one or more windows to the specified width and height.

```chute
resizeWindow(WFConfiguration: Text, WFWidth: Number, WFHeight: Number, WFWindow: Any, WFBringToFront: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFConfiguration` | `Text` | `"Fit Screen"` |
| `WFWidth` | `Number` | — |
| `WFHeight` | `Number` | — |
| `WFWindow` | `Any` | — |
| `WFBringToFront` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.resizewindow`

## `search`

Searches for content in the system that matches the specified text.

```chute
search(WFInputText: Text, WFSpotlightSearchResultType: Text, WFSpotlightSearchLimit: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputText` | `Text` | — |
| `WFSpotlightSearchResultType` | `Text` | `"All"` |
| `WFSpotlightSearchLimit` | `Number` | 5 |

Shortcuts action: `is.workflow.actions.spotlightsearch`

## `searchInPasswords`

Opens Passwords and searches for the given text.

```chute
searchInPasswords(WFShowPasswordsSearchTerm: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShowPasswordsSearchTerm` | `Text` | — |

Shortcuts action: `is.workflow.actions.openpasswords`

## `setFocus`

Sets the specified Focus on or off.

```chute
setFocus(Operation: Text, Enabled: Boolean, AssertionType: Text, Event: Any, Time: Text, FocusModes: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Operation` | `Text` | `"Turn"` |
| `Enabled` | `Boolean` | false |
| `AssertionType` | `Text` | `"Turned Off"` |
| `Event` | `Any` | — |
| `Time` | `Text` | — |
| `FocusModes` | `Text` | — |

Shortcuts action: `is.workflow.actions.dnd.set`

## `setWallpaperPhoto`

Sets the wallpaper to the specified image.

```chute
setWallpaperPhoto(WFInput: Any, WFWallpaperLocation: Text, WFWallpaperShowPreview: Boolean, WFWallpaperPerspectiveZoom: Boolean, WFSelectedPoster: Text, WFWallpaperSmartCrop: Boolean, WFWallpaperLegibilityBlur: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFWallpaperLocation` | `Text` | Lock Screen,Home Screen |
| `WFWallpaperShowPreview` | `Boolean` | true |
| `WFWallpaperPerspectiveZoom` | `Boolean` | false |
| `WFSelectedPoster` | `Text` | — |
| `WFWallpaperSmartCrop` | `Boolean` | true |
| `WFWallpaperLegibilityBlur` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.wallpaper.set`

## `shutDown`

Shuts down or restarts your device.

```chute
shutDown(WFShutdownMode: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShutdownMode` | `Text` | `"Shut Down"` |

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
splitScreenApps(WFPrimaryAppIdentifier: Text, WFSecondaryAppIdentifier: Text, WFAppRatio: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPrimaryAppIdentifier` | `Text` | — |
| `WFSecondaryAppIdentifier` | `Text` | — |
| `WFAppRatio` | `Text` | `"½ + ½"` |

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
startTimer(IntentAppDefinition: Text, WFDuration: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `WFDuration` | `Number` | — |

Shortcuts action: `is.workflow.actions.timer.start`

## `switchBetweenWallpapers`

Switches the current Lock Screen wallpaper.

```chute
switchBetweenWallpapers(WFPoster: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPoster` | `Text` | — |

> If the wallpaper has a linked Focus, this action will set the Focus, too.

Shortcuts action: `is.workflow.actions.posters.switch`

## `takeScreenshot`

Take a screenshot of the device's screen.

```chute
takeScreenshot(WFTakeScreenshotScreenshotType: Text, WFTakeScreenshotActionInteractiveSelectionType: Text, WFTakeScreenshotMainMonitorOnly: Boolean, WFTakeScreenshotIgnoreContextualAssistanceLayers: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFTakeScreenshotScreenshotType` | `Text` | `"Full Screen"` |
| `WFTakeScreenshotActionInteractiveSelectionType` | `Text` | `"Window"` |
| `WFTakeScreenshotMainMonitorOnly` | `Boolean` | false |
| `WFTakeScreenshotIgnoreContextualAssistanceLayers` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.takescreenshot`

## `vibrateDevice`

Vibrates the device for a short amount of time.

```chute
vibrateDevice(WFVibrateHapticType: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFVibrateHapticType` | `Text` | `"Default"` |

Shortcuts action: `is.workflow.actions.vibrate`

## `watchMeDo`

Records and plays back mouse and keyboard events.

```chute
watchMeDo(WFUserEvent: Any, WFPlaybackSpeed: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFUserEvent` | `Any` | — |
| `WFPlaybackSpeed` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.watchmedo`
