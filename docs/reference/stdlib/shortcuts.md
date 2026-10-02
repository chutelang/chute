# Shortcuts

Running and managing other shortcuts.

```chute
import Shortcuts;
```

## `getDetailsOfShortcut`

```chute
getDetailsOfShortcut(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Name \| Action Count \| File Size \| Creation Date \| Last Modified Date \| Folder \| Icon \| Icon Color \| Icon Glyph | — |

Shortcuts action: `is.workflow.actions.properties.workflow`

## `getMyShortcuts`

Gets the shortcuts stored on this device.

```chute
getMyShortcuts(Folder: Text) -> Shortcut
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Folder` | Text | — |

Shortcuts action: `is.workflow.actions.getmyworkflows`

## `runShortcut`

Runs a shortcut from your shortcut.

```chute
runShortcut(WFWorkflow: Text, WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWorkflow` | Text | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.runworkflow`
