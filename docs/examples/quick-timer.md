# quick timer

A shortcut that lets you choose a timer duration, waits, and then sends a notification.

## What you'll learn

- [Control flow](/reference/control-flow) — presenting choices with `menu`
- [Variables and bindings](/reference/variables) — storing values with `const` and `let`
- [String interpolation](/reference/expressions) — embedding values in text with `${}`
- [Standard library actions](/reference/stdlib/scripting) — `wait`, `notification`, `showAlert`

## Source

```chute
shortcut {
  name: "Quick Timer",
  description: "Choose a duration and get notified when time is up",
}

const label = "Timer";

menu "How long?" {
  case "1 minute" {
    wait(60);
    notification("Your 1-minute timer is done!", label);
  }
  case "5 minutes" {
    wait(300);
    notification("Your 5-minute timer is done!", label);
  }
  case "10 minutes" {
    wait(600);
    notification("Your 10-minute timer is done!", label);
  }
}

showAlert("Timer started!");
```

## How it works

The shortcut uses `menu` to present a "Choose from Menu" dialog with three preset durations. Each case calls `wait()`, which compiles to the "Wait" action in Shortcuts, and then sends a push notification with `notification()`.

The `label` variable is defined once and reused across all three cases as the notification title. In the compiled shortcut, this becomes a magic variable that each "Show Notification" action references.

The `showAlert` at the end runs after the menu selection, in Shortcuts, it appears after the "End Menu" action.
