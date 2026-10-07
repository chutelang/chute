# Quick timer

A shortcut that lets you choose a timer duration, waits, and then sends a notification.

## What you'll learn

- [Control flow](/reference/control-flow) with `menu`
- [Variables and bindings](/reference/variables) with `const` and `let`
- [String interpolation](/reference/expressions) with `${}`
- [Scripting actions](/reference/stdlib/scripting), including `Scripting.wait`
- [Notification actions](/reference/stdlib/notification), including `Notification.showNotification` and `Notification.showAlert`

## Source

```chute
import Scripting;
import Notification;

shortcut {
  name: "Quick Timer",
  description: "Choose a duration and get notified when time is up",
}

const label = "Timer";

menu "How long?" {
  case "1 minute" {
    Scripting.wait(60);
    Notification.showNotification("Your 1-minute timer is done!", label);
  }
  case "5 minutes" {
    Scripting.wait(300);
    Notification.showNotification("Your 5-minute timer is done!", label);
  }
  case "10 minutes" {
    Scripting.wait(600);
    Notification.showNotification("Your 10-minute timer is done!", label);
  }
}

Notification.showAlert("Timer started!");
```

## How it works

The `menu` presents three timer durations. Each case calls `Scripting.wait()`, which compiles to the "Wait" action, then sends a notification with `Notification.showNotification()`.

The `label` variable is defined once and reused across all three cases as the notification title. In the compiled shortcut, this becomes a magic variable that each "Show Notification" action references.

`Notification.showAlert` runs after the selected case. In the compiled shortcut, it appears after the "End Menu" action.
