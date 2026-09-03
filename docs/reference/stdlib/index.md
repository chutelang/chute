# Standard Library

Chute's standard library provides access to Siri Shortcuts actions organized into modules.

```chute
import Scripting;
import Notification;

Scripting.askForInput(WFAskActionPrompt: "What is your name?");
Notification.showAlert(WFAlertActionTitle: "Hello!");
```

## Modules

| Module | Actions | Description |
| --- | --- | --- |
| [Apps](apps.md) | 42 | App-specific integrations. |
| [Calendar](calendar.md) | 18 | Events and reminders. |
| [Contacts](contacts.md) | 12 | Contacts, phone calls, and FaceTime. |
| [Device](device.md) | 40 | Device details, clipboard, appearance, and focus modes. |
| [Documents](documents.md) | 33 | Files, folders, archives, PDF, and rich text. |
| [Health](health.md) | 6 | Health data and workouts. |
| [HomeKit](homekit.md) | 3 | Home automation. |
| [Maps](maps.md) | 20 | Location, directions, and weather. |
| [Math](math.md) | 8 | Calculations, measurements, and unit conversion. |
| [Media](media.md) | 66 | Photos, video, audio, camera, and image processing. |
| [Notification](notification.md) | 4 | Alerts, notifications, and banners. |
| [Scripting](scripting.md) | 62 | Control flow, variables, logic, prompts, and general shortcut utilities. |
| [Settings](settings.md) | 22 | System toggles and device settings. |
| [Sharing](sharing.md) | 11 | Sharing content and social media. |
| [Shortcuts](shortcuts.md) | 3 | Running and managing other shortcuts. |
| [Text](text.md) | 17 | Text manipulation, formatting, regex, and speech. |
| [Web](web.md) | 23 | URLs, HTTP requests, web pages, and RSS. |
