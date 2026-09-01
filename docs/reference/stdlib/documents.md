# Documents

Actions for reading, writing, and managing files and folders.

## `getFile`

Open a file from a file storage service.

```text
getFile(path: Text, service: Text = "iCloud Drive")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | `Text` | None | The file path. |
| `service` | `Text` | `"iCloud Drive"` | The storage service to read from. |

Shortcuts action: `is.workflow.actions.documentpicker.open`

## `saveFile`

Save content to a file.

```text
saveFile(input: Text, path: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | None | The content to save. |
| `path` | `Text` | None | The destination file path. |

Shortcuts action: `is.workflow.actions.documentpicker.save`

## `deleteFiles`

Delete files.

```text
deleteFiles(input: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | None | The files to delete. |

Shortcuts action: `is.workflow.actions.file.delete`

## `createFolder`

Create a new folder.

```text
createFolder(path: Text, service: Text = "iCloud Drive")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | `Text` | None | The folder path to create. |
| `service` | `Text` | `"iCloud Drive"` | The storage service. |

Shortcuts action: `is.workflow.actions.file.createfolder`

## `renameFile`

Rename a file.

```text
renameFile(input: Text, name: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | None | The file to rename. |
| `name` | `Text` | None | The new filename. |

Shortcuts action: `is.workflow.actions.file.rename`

## `richTextFromMarkdown`

Convert Markdown text to rich text.

```text
richTextFromMarkdown(input: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | None | The Markdown text to convert. |

Shortcuts action: `is.workflow.actions.getrichtextfrommarkdown`

## `markdownFromRichText`

Convert rich text to Markdown.

```text
markdownFromRichText(input: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | None | The rich text to convert. |

Shortcuts action: `is.workflow.actions.getmarkdownfromrichtext`
