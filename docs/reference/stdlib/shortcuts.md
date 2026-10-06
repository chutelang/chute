# Shortcuts

Running and managing other shortcuts.

```chute
import Shortcuts;
```

## `getDetailsOfShortcut`

```chute
getDetailsOfShortcut(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Action Count \\| File Size \\| Creation Date \\| Last Modified Date \\| Folder \\| Icon \\| Icon Color \\| Icon Glyph | — |

Shortcuts action: `is.workflow.actions.properties.workflow`

## `getMyShortcuts`

Gets the shortcuts stored on this device.

```chute
getMyShortcuts(folder: Text) -> Shortcut
```

| Parameter | Type | Default |
| --- | --- | --- |
| `folder` | Text | — |

Shortcuts action: `is.workflow.actions.getmyworkflows`

## `runShortcut`

Runs a shortcut from your shortcut.

```chute
runShortcut(shortcut: Text, input: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `shortcut` | Text | — |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.runworkflow`
