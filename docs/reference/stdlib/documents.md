# Documents

Files, folders, archives, PDF, and rich text.

```chute
import Documents;
```

## `appendToTextFile`

Adds the text passed as input to the end of the specified text file.

```chute
appendToTextFile(folder: File, filePath: Text, mode: Enum, makeNewLine: Boolean, text: Text) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `folder` | File | — |
| `filePath` | Text | — |
| `mode` | Append \\| Prepend | `"Append"` |
| `makeNewLine` | Boolean | true |
| `text` | Text | — |

> If no file exists yet at the specified path, a new file will be created. Make sure to include a file extension (usually .txt) at the end of your path.

Shortcuts action: `is.workflow.actions.file.append`

## `compressPdf`

Optimizes the file size of the provided PDF file by compressing its images.

If the images contained in the PDF are already compressed, this action might not have a measurable effect on file size.

```chute
compressPdf(pdf: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `pdf` | File | — |

Shortcuts action: `is.workflow.actions.compresspdf`

## `createFolder`

Makes a new folder.

```chute
createFolder(path: Text, folder: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `path` | Text | — |
| `folder` | File | — |

Shortcuts action: `is.workflow.actions.file.createfolder`

## `deleteFiles`

Deletes the files passed in as input.

```chute
deleteFiles(files: File, deleteImmediately: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `files` | File | — |
| `deleteImmediately` | Boolean | false |

Shortcuts action: `is.workflow.actions.file.delete`

## `extractArchive`

Extracts files from the archive passed as input. Many archive formats are supported, including zip, rar, tar.gz, tar.bz2, tar, gzip, cpio, cab, and iso archives.

```chute
extractArchive(archive: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `archive` | File | — |

Shortcuts action: `is.workflow.actions.unzip`

## `findFiles`

```chute
findFiles(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Name \\| File Extension \\| File Size \\| Creation Date \\| Last Modified Date \\| File Path | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.files`

## `getContentsOfFolder`

This action gets the files inside of the specified folder.

```chute
getContentsOfFolder(folder: File, recursive: Boolean) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `folder` | File | — |
| `recursive` | Boolean | false |

Shortcuts action: `is.workflow.actions.file.getfoldercontents`

## `getDetailsOfFiles`

```chute
getDetailsOfFiles(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| File Extension \\| File Size \\| Creation Date \\| Last Modified Date \\| File Path | — |

Shortcuts action: `is.workflow.actions.properties.files`

## `getFileFromFolder`

Gets a file or folder by a relative path, starting at a folder you choose.

```chute
getFileFromFolder(errorIfNotFound: Boolean, ifFolder,FetchContents: Boolean, folder: File, path: Text) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `errorIfNotFound` | Boolean | true |
| `ifFolder,FetchContents` | Boolean | false |
| `folder` | File | — |
| `path` | Text | — |

Shortcuts action: `is.workflow.actions.documentpicker.open`

## `getLinkToFile`

Gets a public iCloud link to the file passed into the action. The specified file must already be uploaded to iCloud.

```chute
getLinkToFile(file: File) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.file.getlink`

## `getParentDirectory`

Gets the common parent directory of the files passed in.

```chute
getParentDirectory(files: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `files` | File | — |

Shortcuts action: `is.workflow.actions.getparentdirectory`

## `getSelectedFilesInFinder`

Gets the files that are currently selected in Finder.

```chute
getSelectedFilesInFinder() -> File
```

Shortcuts action: `is.workflow.actions.finder.getselectedfiles`

## `getTextFromPdf`

Gets text from the provided PDF file.

```chute
getTextFromPdf(pdf: File, type: Enum, pageHeaderText: Text, pageFooterText: Text, combinePages: Boolean) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `pdf` | File | — |
| `type` | Text \\| Rich Text | `"Text"` |
| `pageHeaderText` | Text | — |
| `pageFooterText` | Text | — |
| `combinePages` | Boolean | true |

Shortcuts action: `is.workflow.actions.gettextfrompdf`

## `labelFiles`

Applies a label to the specified files.

```chute
labelFiles(files: File, labelColor: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `files` | File | — |
| `labelColor` | Text | — |

Shortcuts action: `is.workflow.actions.file.label`

## `makeArchive`

Makes an archive out of the files passed as input. Supports creating zip, tar.gz, tar.bz2, tar.xz, tar, gzip, cpio, or iso archives.

```chute
makeArchive(archiveName: Text, format: Text, input: Any) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `archiveName` | Text | — |
| `format` | Text | — |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.makezip`

## `makeDiskImage`

Creates a new disk image (.dmg) file. The disk image will contain any files passed as input.

```chute
makeDiskImage(files: File, volumeName: Text, encrypt: Boolean, sizeToFitContents: Boolean, imageSize: Number) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `files` | File | — |
| `volumeName` | Text | — |
| `encrypt` | Boolean | — |
| `sizeToFitContents` | Boolean | false |
| `imageSize` | Number | 1 |

Shortcuts action: `is.workflow.actions.makediskimage`

## `makeHtmlFromRichText`

Converts the rich text passed as input to HTML text.

```chute
makeHtmlFromRichText(makeFullDocument: Boolean, richText: RichText) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `makeFullDocument` | Boolean | — |
| `richText` | RichText | — |

Shortcuts action: `is.workflow.actions.gethtmlfromrichtext`

## `makeImageFromPdfPage`

Creates images from the pages in the PDF passed into the action.

```chute
makeImageFromPdfPage(pdf: File, imageFormat: Text, color: Text, resolution(dotsPerInch): Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `pdf` | File | — |
| `imageFormat` | Text | — |
| `color` | Text | — |
| `resolution(dotsPerInch)` | Number | 300 |

Shortcuts action: `is.workflow.actions.makeimagefrompdfpage`

## `makeImageFromRichText`

Creates an image from the rich text, web content, or URL passed in as input.

```chute
makeImageFromRichText(richText: Any, width: Number, height: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `richText` | Any | — |
| `width` | Number | 1024 |
| `height` | Number | 768 |

Shortcuts action: `is.workflow.actions.makeimagefromrichtext`

## `makeMarkdownFromRichText`

Converts the rich text passed as input to Markdown text (comparable to Aaron Swartz's html2text script).

```chute
makeMarkdownFromRichText(richText: RichText) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `richText` | RichText | — |

Shortcuts action: `is.workflow.actions.getmarkdownfromrichtext`

## `makePdf`

Makes a PDF out of the input. The resulting PDF can optionally include a quarter-inch margin for better printing.

```chute
makePdf(includeMargin: Boolean, include: Enum, page#: Number, startPage#: Number, endPage#: Number, input: Any, mergeBehavior: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `includeMargin` | Boolean | false |
| `include` | All Pages \\| Single Page \\| Page Range | `"All Pages"` |
| `page#` | Number | — |
| `startPage#` | Number | — |
| `endPage#` | Number | — |
| `input` | Any | — |
| `mergeBehavior` | Append \\| Shuffle | `"Append"` |

Shortcuts action: `is.workflow.actions.makepdf`

## `makeRichTextFromHtml`

Takes the inputted HTML and turns it into rich text, which can then be converted to other formats.

```chute
makeRichTextFromHtml(html: RichText) -> RichText
```

| Parameter | Type | Default |
| --- | --- | --- |
| `html` | RichText | — |

Shortcuts action: `is.workflow.actions.getrichtextfromhtml`

## `makeRichTextFromMarkdown`

Takes the inputted Markdown and turns it into rich text, which can then be converted to other formats.

```chute
makeRichTextFromMarkdown(markdownText: Text) -> RichText
```

| Parameter | Type | Default |
| --- | --- | --- |
| `markdownText` | Text | — |

Shortcuts action: `is.workflow.actions.getrichtextfrommarkdown`

## `mountDiskImage`

Mounts a disk image (.dmg) file on your desktop.

```chute
mountDiskImage(file: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.mountdiskimage`

## `moveFile`

Moves the specified file to a new location.

```chute
moveFile(file: File, folder: File, replaceExistingFiles: Boolean) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |
| `folder` | File | — |
| `replaceExistingFiles` | Boolean | false |

Shortcuts action: `is.workflow.actions.file.move`

## `print`

Prints the input using AirPrint.

```chute
print(input: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Any | — |

Shortcuts action: `is.workflow.actions.print`

## `quickLook`

Displays a preview of the input using the system Quick Look.

```chute
quickLook(input: File, fullScreen: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | File | — |
| `fullScreen` | Boolean | — |

Shortcuts action: `is.workflow.actions.previewdocument`

## `renameFile`

Renames the specified file.

```chute
renameFile(file: File, name: Text) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |
| `name` | Text | — |

Shortcuts action: `is.workflow.actions.file.rename`

## `revealFilesInFinder`

Opens windows in the Finder with the specified files selected.

```chute
revealFilesInFinder(files: File)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `files` | File | — |

Shortcuts action: `is.workflow.actions.file.reveal`

## `saveFile`

Saves files to a specified folder. You can also use this action to copy a file.

```chute
saveFile(file: File, folder: File, askWhereToSave: Boolean, subpath: Text, overwriteIfFileExists: Boolean) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |
| `folder` | File | — |
| `askWhereToSave` | Boolean | true |
| `subpath` | Text | — |
| `overwriteIfFileExists` | Boolean | false |

Shortcuts action: `is.workflow.actions.documentpicker.save`

## `selectFile`

Prompts to select files or folders.

```chute
selectFile(type: Enum, selectMultiple: Boolean) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Files \\| Folders | `"Files"` |
| `selectMultiple` | Boolean | false |

Shortcuts action: `is.workflow.actions.file.select`

## `specifyFile`

Passes the specified files or folders as output.

```chute
specifyFile(file: File) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `file` | File | — |

Shortcuts action: `is.workflow.actions.file`

## `splitPdfIntoPages`

Splits the input document by creating a PDF for each page.

```chute
splitPdfIntoPages(pdf: File) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `pdf` | File | — |

Shortcuts action: `is.workflow.actions.splitpdf`
