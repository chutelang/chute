# Documents

Files, folders, archives, PDF, and rich text.

```chute
import Documents;
```

## `appendToTextFile`

Adds the text passed as input to the end of the specified text file.

```chute
appendToTextFile(WFFile: Any, WFFilePath: Text, WFAppendFileWriteMode: Text, WFAppendOnNewLine: Boolean, WFInput: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |
| `WFFilePath` | `Text` | — |
| `WFAppendFileWriteMode` | `Text` | `"Append"` |
| `WFAppendOnNewLine` | `Boolean` | true |
| `WFInput` | `Text` | — |

> If no file exists yet at the specified path, a new file will be created. Make sure to include a file extension (usually .txt) at the end of your path.

Shortcuts action: `is.workflow.actions.file.append`

## `createFolder`

Makes a new folder.

```chute
createFolder(WFFilePath: Text, WFFolder: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFilePath` | `Text` | — |
| `WFFolder` | `Any` | — |

Shortcuts action: `is.workflow.actions.file.createfolder`

## `deleteFiles`

Deletes the files passed in as input.

```chute
deleteFiles(WFInput: Any, WFDeleteImmediatelyDelete: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFDeleteImmediatelyDelete` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.file.delete`

## `extractArchive`

Extracts files from the archive passed as input. Many archive formats are supported, including zip, rar, tar.gz, tar.bz2, tar, gzip, cpio, cab, and iso archives.

```chute
extractArchive(WFArchive: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFArchive` | `Any` | — |

Shortcuts action: `is.workflow.actions.unzip`

## `file`

Passes the specified files or folders as output.

```chute
file(WFFile: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |

Shortcuts action: `is.workflow.actions.file`

## `filterFiles`

```chute
filterFiles()
```

Shortcuts action: `is.workflow.actions.filter.files`

## `getContentsOfFolder`

This action gets the files inside of the specified folder.

```chute
getContentsOfFolder(WFFolder: Any, Recursive: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFolder` | `Any` | — |
| `Recursive` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.file.getfoldercontents`

## `getDetailsOfFiles`

```chute
getDetailsOfFiles()
```

Shortcuts action: `is.workflow.actions.properties.files`

## `getFileFromFolder`

Gets a file or folder by a relative path, starting at a folder you choose.

```chute
getFileFromFolder(WFFileErrorIfNotFound: Boolean, WFGetFolderContents: Boolean, WFFile: Any, WFGetFilePath: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFileErrorIfNotFound` | `Boolean` | true |
| `WFGetFolderContents` | `Boolean` | false |
| `WFFile` | `Any` | — |
| `WFGetFilePath` | `Text` | — |

Shortcuts action: `is.workflow.actions.documentpicker.open`

## `getLinkToFile`

Gets a public iCloud link to the file passed into the action. The specified file must already be uploaded to iCloud.

```chute
getLinkToFile(WFFile: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |

Shortcuts action: `is.workflow.actions.file.getlink`

## `getParentDirectory`

Gets the common parent directory of the files passed in.

```chute
getParentDirectory(WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.getparentdirectory`

## `getSelectedFilesInFinder`

Gets the files that are currently selected in Finder.

```chute
getSelectedFilesInFinder() -> Any
```

Shortcuts action: `is.workflow.actions.finder.getselectedfiles`

## `getTextFromPdf`

Gets text from the provided PDF file.

```chute
getTextFromPdf(WFInput: Any, WFGetTextFromPDFTextType: Text, WFGetTextFromPDFPageHeader: Text, WFGetTextFromPDFPageFooter: Text, WFCombinePages: Boolean) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFGetTextFromPDFTextType` | `Text` | `"Text"` |
| `WFGetTextFromPDFPageHeader` | `Text` | — |
| `WFGetTextFromPDFPageFooter` | `Text` | — |
| `WFCombinePages` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.gettextfrompdf`

## `labelFiles`

Applies a label to the specified files.

```chute
labelFiles(WFInput: Any, WFLabelColorNumber: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFLabelColorNumber` | `Text` | — |

Shortcuts action: `is.workflow.actions.file.label`

## `makeArchive`

Makes an archive out of the files passed as input. Supports creating zip, tar.gz, tar.bz2, tar.xz, tar, gzip, cpio, or iso archives.

```chute
makeArchive(WFZIPName: Text, WFArchiveFormat: Text, WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFZIPName` | `Text` | — |
| `WFArchiveFormat` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.makezip`

## `makeDiskImage`

Creates a new disk image (.dmg) file. The disk image will contain any files passed as input.

```chute
makeDiskImage(WFInput: Any, VolumeName: Text, EncryptImage: Boolean, SizeToFit: Boolean, ImageSize: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `VolumeName` | `Text` | — |
| `EncryptImage` | `Boolean` | — |
| `SizeToFit` | `Boolean` | false |
| `ImageSize` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.makediskimage`

## `makeHtmlFromRichText`

Converts the rich text passed as input to HTML text.

```chute
makeHtmlFromRichText(WFMakeFullDocument: Boolean, WFInput: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeFullDocument` | `Boolean` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.gethtmlfromrichtext`

## `makeImageFromPdfPage`

Creates images from the pages in the PDF passed into the action.

```chute
makeImageFromPdfPage(WFInput: Any, WFMakeImageFromPDFPageImageFormat: Text, WFMakeImageFromPDFPageColorspace: Text, WFMakeImageFromPDFPageResolution: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFMakeImageFromPDFPageImageFormat` | `Text` | — |
| `WFMakeImageFromPDFPageColorspace` | `Text` | — |
| `WFMakeImageFromPDFPageResolution` | `Number` | 300 |

Shortcuts action: `is.workflow.actions.makeimagefrompdfpage`

## `makeImageFromRichText`

Creates an image from the rich text, web content, or URL passed in as input.

```chute
makeImageFromRichText(WFInput: Any, WFWidth: Number, WFHeight: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFWidth` | `Number` | 1024 |
| `WFHeight` | `Number` | 768 |

Shortcuts action: `is.workflow.actions.makeimagefromrichtext`

## `makeMarkdownFromRichText`

Converts the rich text passed as input to Markdown text (comparable to Aaron Swartz's html2text script).

```chute
makeMarkdownFromRichText(WFInput: Any) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.getmarkdownfromrichtext`

## `makePdf`

Makes a PDF out of the input. The resulting PDF can optionally include a quarter-inch margin for better printing.

```chute
makePdf(WFPDFIncludeMargin: Boolean, WFPDFIncludedPages: Text, WFPDFSinglePage: Number, WFPDFPageRangeStart: Number, WFPDFPageRangeEnd: Number, WFInput: Any, WFPDFDocumentMergeBehavior: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPDFIncludeMargin` | `Boolean` | false |
| `WFPDFIncludedPages` | `Text` | `"All Pages"` |
| `WFPDFSinglePage` | `Number` | — |
| `WFPDFPageRangeStart` | `Number` | — |
| `WFPDFPageRangeEnd` | `Number` | — |
| `WFInput` | `Any` | — |
| `WFPDFDocumentMergeBehavior` | `Text` | `"Append"` |

Shortcuts action: `is.workflow.actions.makepdf`

## `makeRichTextFromHtml`

Takes the inputted HTML and turns it into rich text, which can then be converted to other formats.

```chute
makeRichTextFromHtml(WFHTML: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFHTML` | `Any` | — |

Shortcuts action: `is.workflow.actions.getrichtextfromhtml`

## `makeRichTextFromMarkdown`

Takes the inputted Markdown and turns it into rich text, which can then be converted to other formats.

```chute
makeRichTextFromMarkdown(WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.getrichtextfrommarkdown`

## `mountDiskImage`

Mounts a disk image (.dmg) file on your desktop.

```chute
mountDiskImage(WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.mountdiskimage`

## `moveFile`

Moves the specified file to a new location.

```chute
moveFile(WFFile: Any, WFFolder: Any, WFReplaceExisting: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |
| `WFFolder` | `Any` | — |
| `WFReplaceExisting` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.file.move`

## `optimizeFileSizeOfPdf`

Optimizes the file size of the provided PDF file by compressing its images.

If the images contained in the PDF are already compressed, this action might not have a measurable effect on file size.

```chute
optimizeFileSizeOfPdf(WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.compresspdf`

## `print`

Prints the input using AirPrint.

```chute
print(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.print`

## `quickLook`

Displays a preview of the input using the system Quick Look.

```chute
quickLook(WFInput: Any, WFQuickLookActionFullScreen: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFQuickLookActionFullScreen` | `Boolean` | — |

Shortcuts action: `is.workflow.actions.previewdocument`

## `renameFile`

Renames the specified file.

```chute
renameFile(WFFile: Any, WFNewFilename: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |
| `WFNewFilename` | `Text` | — |

Shortcuts action: `is.workflow.actions.file.rename`

## `revealFilesInFinder`

Opens windows in the Finder with the specified files selected.

```chute
revealFilesInFinder(WFFile: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFFile` | `Any` | — |

Shortcuts action: `is.workflow.actions.file.reveal`

## `saveFile`

Saves files to a specified folder. You can also use this action to copy a file.

```chute
saveFile(WFInput: Any, WFFolder: Any, WFAskWhereToSave: Boolean, WFFileDestinationPath: Text, WFSaveFileOverwrite: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFFolder` | `Any` | — |
| `WFAskWhereToSave` | `Boolean` | true |
| `WFFileDestinationPath` | `Text` | — |
| `WFSaveFileOverwrite` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.documentpicker.save`

## `selectFile`

Prompts to select files or folders.

```chute
selectFile(WFPickingMode: Text, SelectMultiple: Boolean) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPickingMode` | `Text` | `"Files"` |
| `SelectMultiple` | `Boolean` | false |

Shortcuts action: `is.workflow.actions.file.select`

## `splitPdfIntoPages`

Splits the input document by creating a PDF for each page.

```chute
splitPdfIntoPages(WFInput: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.splitpdf`
