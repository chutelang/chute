# Device

Device details, clipboard, appearance, and focus modes.

```chute
import Device;
```

## `connectToServers`

Connects your computer to the specified file servers on the network. For example, you can connect to SMB/CIFS, NFS, FTP (read-only), or WebDAV servers.

```chute
connectToServers(smb:Computer.local: Text) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `smb:Computer.local` | Text | — |

Shortcuts action: `is.workflow.actions.connecttoservers`

## `copyToClipboard`

Copies the result of the last action to the clipboard.

```chute
copyToClipboard(localOnly: Boolean, expireAt: Text, content: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `localOnly` | Boolean | false |
| `expireAt` | Text | — |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.setclipboard`

## `createAlarm`

```chute
createAlarm()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTCreateAlarmIntent`

## `ejectDisk`

This action ejects a mounted disk or volume.

```chute
ejectDisk(disk: File)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `disk` | File | — |

Shortcuts action: `is.workflow.actions.ejectdisk`

## `findDisplays`

```chute
findDisplays(sortBy: Text, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Display
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Text | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.displays`

## `findWindows`

```chute
findWindows(sortBy: Text, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Window
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Text | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.windows`

## `getAlarms`

```chute
getAlarms()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTGetAlarmsIntent`

## `getAllWallpapers`

Gets all of your Lock Screen wallpapers, and returns them as output so you can use them with other actions.

```chute
getAllWallpapers(type: Enum) -> Poster
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | All \\| Current | `"All"` |

Shortcuts action: `is.workflow.actions.posters.get`

## `getBatteryStatus`

Returns information about the battery and any charger connected to the device.

```chute
getBatteryStatus(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Battery Level \\| Is Charging \\| Is Connected to Charger \\| Charge Limit | `"Battery Level"` |

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
getCurrentApp(scope: Enum) -> App
```

| Parameter | Type | Default |
| --- | --- | --- |
| `scope` | Current \\| Visible | `"Current"` |

Shortcuts action: `is.workflow.actions.getcurrentapp`

## `getCurrentFocus`

Returns the currently active Focus.

```chute
getCurrentFocus() -> FocusMode
```

> This action returns nothing if no Focus is active.

Shortcuts action: `is.workflow.actions.dnd.getfocus`

## `getCurrentIpAddress`

Returns the local or external IP address of the device.

```chute
getCurrentIpAddress(address: Enum, type: Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `address` | External \\| Local | `"External"` |
| `type` | IPv4 \\| IPv6 | `"IPv4"` |

Shortcuts action: `is.workflow.actions.getipaddress`

## `getDeviceDetails`

Gets information about the current device.

```chute
getDeviceDetails(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Device Name \\| Device Hostname \\| Device Model \\| Device Is Watch \\| System Version \\| System Build Number \\| Screen Width \\| Screen Height \\| Current Volume \\| Current Brightness \\| Current Appearance \\| Device Is Locked | `"Device Name"` |

Shortcuts action: `is.workflow.actions.getdevicedetails`

## `getNetworkDetails`

Gets information about the currently connected networks.

```chute
getNetworkDetails(network: Text, WFWiFiDetail: Enum, WFCellularDetail: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `network` | Text | — |
| `WFWiFiDetail` | Network Name \\| BSSID \\| Wi-Fi Standard \\| RX Rate \\| TX Rate \\| RSSI \\| Noise \\| Channel Number \\| Hardware MAC Address | `"Network Name"` |
| `WFCellularDetail` | Carrier Name \\| Radio Technology \\| Country Code \\| Is Roaming Abroad \\| Number of Signal Bars | `"Carrier Name"` |

Shortcuts action: `is.workflow.actions.getwifi`

## `getWhatsOnScreen`

Gets the current content on screen, if available.

```chute
getWhatsOnScreen() -> File
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
hideApp(mode: Enum, app: Text, apps: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | App \\| All Apps | `"App"` |
| `app` | Text | — |
| `apps` | Text | — |

Shortcuts action: `is.workflow.actions.hide.app`

## `lockApp`

Changes whether the selected application is locked. Locked apps require authentication to access.

```chute
lockApp(operation: Enum, app: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Lock \\| Unlock \\| Toggle | `"Lock"` |
| `app` | Text | — |

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
moveWindow(position: Enum, x: Number, y: Number, window: Window, bringToFront: Boolean, display: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `position` | Top Left \\| Top Center \\| Top Right \\| Middle Left \\| Center \\| Middle Right \\| Bottom Left \\| Bottom Center \\| Bottom Right \\| Coordinates | `"Center"` |
| `x` | Number | — |
| `y` | Number | — |
| `window` | Window | — |
| `bringToFront` | Boolean | true |
| `display` | Text | — |

Shortcuts action: `is.workflow.actions.movewindow`

## `putDisplayToSleep`

Puts the display(s) of this Mac to sleep.

```chute
putDisplayToSleep()
```

Shortcuts action: `is.workflow.actions.displaysleep`

## `quitApp`

Quits one or all open applications. You can choose a list of apps to keep open.

```chute
quitApp(mode: Enum, apps: Text, app: Text, askToSaveChanges: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | App \\| All Apps | `"App"` |
| `apps` | Text | — |
| `app` | Text | — |
| `askToSaveChanges` | Boolean | true |

Shortcuts action: `is.workflow.actions.quit.app`

## `resizeWindow`

Resizes one or more windows to the specified width and height.

```chute
resizeWindow(configuration: Enum, width: Number, height: Number, window: Window, bringToFront: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `configuration` | Fit Screen \\| Top Half \\| Bottom Half \\| Left Half \\| Right Half \\| Top Left Quarter \\| Top Right Quarter \\| Bottom Left Quarter \\| Bottom Right Quarter \\| Dimensions | `"Fit Screen"` |
| `width` | Number | — |
| `height` | Number | — |
| `window` | Window | — |
| `bringToFront` | Boolean | true |

Shortcuts action: `is.workflow.actions.resizewindow`

## `search`

Searches for content in the system that matches the specified text.

```chute
search(text: Text, type: Text, WFSpotlightSearchLimit: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |
| `type` | Text | `"All"` |
| `WFSpotlightSearchLimit` | Number | 5 |

Shortcuts action: `is.workflow.actions.spotlightsearch`

## `searchInPasswords`

Opens Passwords and searches for the given text.

```chute
searchInPasswords(text: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.openpasswords`

## `setFocus`

Sets the specified Focus on or off.

```chute
setFocus(operation: Enum, state: Boolean, until: Enum, event: Any, time: Text, focus: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Turn \\| Toggle | `"Turn"` |
| `state` | Boolean | false |
| `until` | Turned Off \\| Time \\| I Leave \\| Event Ends | `"Turned Off"` |
| `event` | Any | — |
| `time` | Text | — |
| `focus` | Text | — |

Shortcuts action: `is.workflow.actions.dnd.set`

## `setWallpaperPhoto`

Sets the wallpaper to the specified image.

```chute
setWallpaperPhoto(image: Image, wallpaperLocation: Enum, showPreview: Boolean, perspectiveZoom: Boolean, wallpaper: Text, cropToSubject: Boolean, legibilityBlur: Boolean) -> Poster
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |
| `wallpaperLocation` | Lock Screen \\| Home Screen | Lock Screen,Home Screen |
| `showPreview` | Boolean | true |
| `perspectiveZoom` | Boolean | false |
| `wallpaper` | Text | — |
| `cropToSubject` | Boolean | true |
| `legibilityBlur` | Boolean | true |

Shortcuts action: `is.workflow.actions.wallpaper.set`

## `shutDown`

Shuts down or restarts your device.

```chute
shutDown(mode: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | Shut Down \\| Restart | `"Shut Down"` |

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
splitScreenApps(WFPrimaryAppIdentifier: Text, WFSecondaryAppIdentifier: Text, ratio: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPrimaryAppIdentifier` | Text | — |
| `WFSecondaryAppIdentifier` | Text | — |
| `ratio` | ½ + ½ \\| ⅔ + ⅓ | `"½ + ½"` |

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
startTimer(app: Text, duration: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | [object Object] |
| `duration` | Number | — |

Shortcuts action: `is.workflow.actions.timer.start`

## `switchBetweenWallpapers`

Switches the current Lock Screen wallpaper.

```chute
switchBetweenWallpapers(wallpaper: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `wallpaper` | Text | — |

> If the wallpaper has a linked Focus, this action will set the Focus, too.

Shortcuts action: `is.workflow.actions.posters.switch`

## `takeScreenshot`

Take a screenshot of the device's screen.

```chute
takeScreenshot(type: Enum, selection: Enum, captureMainDisplayOnly: Boolean, ignoreContextualAssistanceLayers: Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Full Screen \\| Interactive | `"Full Screen"` |
| `selection` | Window \\| Custom | `"Window"` |
| `captureMainDisplayOnly` | Boolean | false |
| `ignoreContextualAssistanceLayers` | Boolean | false |

Shortcuts action: `is.workflow.actions.takescreenshot`

## `toggleAlarm`

```chute
toggleAlarm()
```

Shortcuts action: `com.apple.mobiletimer-framework.MobileTimerIntents.MTToggleAlarmIntent`

## `vibrateDevice`

Vibrates the device for a short amount of time.

```chute
vibrateDevice(hapticPattern: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `hapticPattern` | Default \\| Up Direction \\| Down Direction \\| Success \\| Failure \\| Retry \\| Start \\| Stop \\| Click | `"Default"` |

Shortcuts action: `is.workflow.actions.vibrate`

## `watchMeDo`

Records and plays back mouse and keyboard events.

```chute
watchMeDo(userEvent: Any, playbackSpeed: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `userEvent` | Any | — |
| `playbackSpeed` | Number | 1 |

Shortcuts action: `is.workflow.actions.watchmedo`
