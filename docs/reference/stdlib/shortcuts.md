# Shortcuts

Running and managing other shortcuts.

```chute
import Shortcuts;
```

## `getDetailsOfShortcut`

```chute
getDetailsOfShortcut()
```

Shortcuts action: `is.workflow.actions.properties.workflow`

## `getMyShortcuts`

Gets the shortcuts stored on this device.

```chute
getMyShortcuts(Folder: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Folder` | `Text` | — |

Shortcuts action: `is.workflow.actions.getmyworkflows`

## `runShortcut`

Runs a shortcut from your shortcut.

```chute
runShortcut(WFWorkflow: Text, WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWorkflow` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.runworkflow`
