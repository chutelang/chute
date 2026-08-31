# Media

Actions for capturing, selecting, and processing photos and media.

## takePicture

Capture a photo with the camera.

```text
takePicture()
```

Shortcuts action: `is.workflow.actions.takephoto`

## selectPhotos

Let the user select photos from the photo library.

```text
selectPhotos(count: Number = 1) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `Number` | `1` | The maximum number of photos to select. |

Returns a list of selected photos.

Shortcuts action: `is.workflow.actions.selectphoto`

## getLatestPhotos

Get the most recent photos from the photo library.

```text
getLatestPhotos(count: Number = 1) -> List<Text>
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `Number` | `1` | The number of photos to retrieve. |

Returns a list of photos.

Shortcuts action: `is.workflow.actions.getlatestphotos`

## saveToPhotoAlbum

Save content to a photo album.

```text
saveToPhotoAlbum(input: Text, album: Text = "Recents")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The content to save. |
| `album` | `Text` | `"Recents"` | The album to save to. |

Shortcuts action: `is.workflow.actions.savetocameraroll`

## encodeMedia

Encode media to a different format.

```text
encodeMedia(input: Text, format: Text = "M4A")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The media to encode. |
| `format` | `Text` | `"M4A"` | The target format. |

Shortcuts action: `is.workflow.actions.encodemedia`

## trimMedia

Trim audio or video content.

```text
trimMedia(input: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `Text` | — | The media to trim. |

Shortcuts action: `is.workflow.actions.trimmedia`
