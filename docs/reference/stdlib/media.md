# Media

Photos, video, audio, camera, and image processing.

```chute
import Media;
```

## `addFrameToGif`

Adds an image to the existing animated GIF passed as input. If no GIF is passed as input, a new animated GIF is created.

```chute
addFrameToGif(WFImage: Any, WFInputGIF: Any, WFGIFDelayTime: Number, WFGIFAutoSize: Boolean, WFGIFManualSizeWidth: Number, WFGIFManualSizeHeight: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | `Any` | — |
| `WFInputGIF` | `Any` | — |
| `WFGIFDelayTime` | `Number` | 0.25 |
| `WFGIFAutoSize` | `Boolean` | true |
| `WFGIFManualSizeWidth` | `Number` | — |
| `WFGIFManualSizeHeight` | `Number` | — |

Shortcuts action: `is.workflow.actions.addframetogif`

## `addToPlayingNext`

Adds the music passed as input to your Playing Next queue.

```chute
addToPlayingNext(WFWhenToPlay: Text, WFMusic: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWhenToPlay` | `Text` | `"Next"` |
| `WFMusic` | `Any` | — |

Shortcuts action: `is.workflow.actions.addmusictoupnext`

## `addToPlaylist`

Adds the items passed as input to the specified playlist.

```chute
addToPlaylist(WFPlaylistName: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.addtoplaylist`

## `changePlaybackDestination`

Changes the current playback destination. Use this action to route audio to AirPods, Bluetooth speakers, HomePod, or other AirPlay devices. Optionally, this action can add or remove devices from a group, so you can route audio to multiple devices at once.

```chute
changePlaybackDestination(WFMediaRouteOperation: Text, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaRouteOperation` | `Text` | `"Set"` |
| `WFMediaRoute` | `Text` | `"Local"` |

> When attempting to add a device that does not support groups, all other devices are removed as playback destinations first.

Shortcuts action: `is.workflow.actions.setplaybackdestination`

## `clearPlayingNext`

Clears all the music in your Playing Next queue.

```chute
clearPlayingNext()
```

Shortcuts action: `is.workflow.actions.clearupnext`

## `combineImages`

Combines the images passed into the action horizontally, vertically, or in a grid.

```chute
combineImages(WFImageCombineMode: Text, WFImageCombineSpacing: Number, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageCombineMode` | `Text` | `"Horizontally"` |
| `WFImageCombineSpacing` | `Number` | 0 |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.combine`

## `convertImage`

Converts the images passed into the action to the specified image format.

```chute
convertImage(WFImageFormat: Text, WFImageCompressionQuality: Number, WFImagePreserveMetadata: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageFormat` | `Text` | `"JPEG"` |
| `WFImageCompressionQuality` | `Number` | 0.75 |
| `WFImagePreserveMetadata` | `Boolean` | true |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.convert`

## `createPhotoAlbum`

Creates a new album in the Photos app, including the specified photos and videos.

```chute
createPhotoAlbum(AlbumName: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `AlbumName` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.photos.createalbum`

## `createPlaylist`

Creates a new playlist in the Music app, adding any items passed as input to the new playlist.

```chute
createPlaylist(WFPlaylistName: Text, WFPlaylistAuthor: Text, WFPlaylistDescription: Text, WFPlaylistItems: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | `Text` | — |
| `WFPlaylistAuthor` | `Text` | — |
| `WFPlaylistDescription` | `Text` | — |
| `WFPlaylistItems` | `Any` | — |

Shortcuts action: `is.workflow.actions.createplaylist`

## `cropImage`

Crops images to a smaller rectangle.

```chute
cropImage(WFInput: Any, WFImageCropPosition: Text, WFImageCropX: Number, WFImageCropY: Number, WFImageCropWidth: Number, WFImageCropHeight: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFImageCropPosition` | `Text` | `"Center"` |
| `WFImageCropX` | `Number` | — |
| `WFImageCropY` | `Number` | — |
| `WFImageCropWidth` | `Number` | 100 |
| `WFImageCropHeight` | `Number` | 100 |

Shortcuts action: `is.workflow.actions.image.crop`

## `deletePhotos`

Deletes the photos passed as input from the device's photo library. This action asks for confirmation before performing the deletion.

```chute
deletePhotos()
```

Shortcuts action: `is.workflow.actions.deletephotos`

## `encodeMedia`

Re-encodes the media passed as input at the specified size, optionally converting to audio.

```chute
encodeMedia(WFMedia: Any, WFMediaAudioOnly: Boolean, WFMediaAudioFormat: Text, WFMediaSize: Text, WFMediaSpeed: Text, WFMediaPreserveTransparency: Boolean, WFMediaCustomSpeed: Number, Metadata: Any, WFMetadataTitle: Text, WFMetadataArtist: Text, WFMetadataAlbum: Text, WFMetadataGenre: Text, WFMetadataYear: Text, WFMetadataArtwork: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMedia` | `Any` | — |
| `WFMediaAudioOnly` | `Boolean` | false |
| `WFMediaAudioFormat` | `Text` | `"M4A"` |
| `WFMediaSize` | `Text` | `"Passthrough"` |
| `WFMediaSpeed` | `Text` | `"Normal"` |
| `WFMediaPreserveTransparency` | `Boolean` | false |
| `WFMediaCustomSpeed` | `Number` | — |
| `Metadata` | `Any` | — |
| `WFMetadataTitle` | `Text` | — |
| `WFMetadataArtist` | `Text` | — |
| `WFMetadataAlbum` | `Text` | — |
| `WFMetadataGenre` | `Text` | — |
| `WFMetadataYear` | `Text` | — |
| `WFMetadataArtwork` | `Any` | — |

Shortcuts action: `is.workflow.actions.encodemedia`

## `filterImages`

```chute
filterImages()
```

Shortcuts action: `is.workflow.actions.filter.images`

## `finderConvertImage`

```chute
finderConvertImage(WFPreserveMetadata: Boolean, WFImage: Any, WFFileFormat: Text, WFSize: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPreserveMetadata` | `Boolean` | — |
| `WFImage` | `Any` | — |
| `WFFileFormat` | `Text` | `"JPEG"` |
| `WFSize` | `Text` | `"Small"` |

Shortcuts action: `is.workflow.actions.image.convert.finder`

## `findGiphyGifs`

Finds GIFs representing the provided text, using Giphy.

```chute
findGiphyGifs(WFGiphyQuery: Text, WFGiphyShowPicker: Boolean, WFGiphyLimit: Number, WFGiphySelectMultiple: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGiphyQuery` | `Text` | — |
| `WFGiphyShowPicker` | `Boolean` | true |
| `WFGiphyLimit` | `Number` | 1 |
| `WFGiphySelectMultiple` | `Boolean` | — |

> Powered by Giphy (giphy.com)

Shortcuts action: `is.workflow.actions.giphy`

## `findMusic`

```chute
findMusic()
```

Shortcuts action: `is.workflow.actions.filter.music`

## `findPhotos`

```chute
findPhotos()
```

Shortcuts action: `is.workflow.actions.filter.photos`

## `findPodcasts`

Finds podcasts in the Apple Podcasts catalog, returning the items that match the specified search terms.

```chute
findPodcasts(WFSearchTerm: Text, WFAttribute: Text, WFEntity: Text, WFCountry: Text, WFItemLimit: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | `Text` | — |
| `WFAttribute` | `Text` | — |
| `WFEntity` | `Text` | — |
| `WFCountry` | `Text` | — |
| `WFItemLimit` | `Number` | 25 |

Shortcuts action: `is.workflow.actions.searchpodcasts`

## `flipImage`

Reverses the direction of images either horizontally or vertically.

```chute
flipImage(WFImageFlipDirection: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageFlipDirection` | `Text` | `"Horizontal"` |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.flip`

## `followPodcast`

Follows podcasts or podcast feed URLs passed into the action.

```chute
followPodcast(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.podcasts.subscribe`

## `getCurrentSong`

Returns the song that is currently playing in the Music app, if any.

```chute
getCurrentSong(Subject: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Subject` | `Text` | `"Current Song"` |

Shortcuts action: `is.workflow.actions.getcurrentsong`

## `getDetailsOfImages`

```chute
getDetailsOfImages()
```

Shortcuts action: `is.workflow.actions.properties.images`

## `getDetailsOfItunesArtist`

```chute
getDetailsOfItunesArtist()
```

Shortcuts action: `is.workflow.actions.properties.itunesartist`

## `getDetailsOfItunesProduct`

```chute
getDetailsOfItunesProduct()
```

Shortcuts action: `is.workflow.actions.properties.itunesstore`

## `getDetailsOfMusic`

```chute
getDetailsOfMusic()
```

Shortcuts action: `is.workflow.actions.properties.music`

## `getDetailsOfPodcast`

```chute
getDetailsOfPodcast()
```

Shortcuts action: `is.workflow.actions.properties.podcastshow`

## `getDetailsOfPodcastEpisode`

```chute
getDetailsOfPodcastEpisode()
```

Shortcuts action: `is.workflow.actions.properties.podcast`

## `getDetailsOfShazam`

```chute
getDetailsOfShazam()
```

Shortcuts action: `is.workflow.actions.properties.shazam`

## `getEpisodesOfPodcast`

Returns a list of episodes from a podcast show.

```chute
getEpisodesOfPodcast(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.getepisodesforpodcast`

## `getFramesFromImage`

Splits an animated GIF or a photo burst into individual frames.

```chute
getFramesFromImage(WFImage: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | `Any` | — |

Shortcuts action: `is.workflow.actions.getframesfromimage`

## `getLastImport`

Gets the most recent photo import from the Photos app.

```chute
getLastImport()
```

Shortcuts action: `is.workflow.actions.getlatestphotoimport`

## `getLatestBursts`

Gets the most recent burst photos from the photo library.

```chute
getLatestBursts(WFGetLatestPhotoCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.getlatestbursts`

## `getLatestLivePhotos`

Gets the most recent Live Photos from the photo library.

```chute
getLatestLivePhotos(WFGetLatestPhotoCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.getlatestlivephotos`

## `getLatestPhotos`

Gets the most recent photos from the photo library.

```chute
getLatestPhotos(WFGetLatestPhotoCount: Number, WFGetLatestPhotosActionIncludeScreenshots: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | `Number` | 1 |
| `WFGetLatestPhotosActionIncludeScreenshots` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.getlastphoto`

## `getLatestScreenshots`

Gets the most recent screenshots from the photo library.

```chute
getLatestScreenshots(WFGetLatestPhotoCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.getlastscreenshot`

## `getLatestVideos`

Gets the most recent videos from the photo library.

```chute
getLatestVideos(WFGetLatestPhotoCount: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.getlastvideo`

## `getPlaylist`

Gets every song in the specified playlist.

```chute
getPlaylist(WFPlaylistName: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | `Text` | — |

Shortcuts action: `is.workflow.actions.get.playlist`

## `getPodcastsFromLibrary`

Gets a list of all shows in your Podcast library.

```chute
getPodcastsFromLibrary()
```

Shortcuts action: `is.workflow.actions.getpodcastsfromlibrary`

## `handOffPlayback`

Hands off Music or Podcasts playback between two devices.

```chute
handOffPlayback(WFSourceMediaRoute: Text, WFDestinationMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSourceMediaRoute` | `Text` | — |
| `WFDestinationMediaRoute` | `Text` | — |

Shortcuts action: `is.workflow.actions.handoffplayback`

## `importAudioFilesIntoMusic`

Imports audio files into Music and compresses them with the chosen encoder.

```chute
importAudioFilesIntoMusic(WFInput: Any, WFImportAudioFilesReencode: Boolean, WFImportAudioFilesEncoder: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFImportAudioFilesReencode` | `Boolean` | false |
| `WFImportAudioFilesEncoder` | `Text` | `"Default"` |

Shortcuts action: `is.workflow.actions.importaudiofiles`

## `makeGif`

Creates an animated GIF from the images or video passed into the action.

```chute
makeGif(WFMakeGIFActionDelayTime: Number, WFMakeGIFActionLoopEnabled: Boolean, WFMakeGIFActionLoopCount: Number, WFMakeGIFActionAutoSize: Boolean, WFMakeGIFActionManualSizeWidth: Number, WFMakeGIFActionManualSizeHeight: Number, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeGIFActionDelayTime` | `Number` | 0.2 |
| `WFMakeGIFActionLoopEnabled` | `Boolean` | true |
| `WFMakeGIFActionLoopCount` | `Number` | — |
| `WFMakeGIFActionAutoSize` | `Boolean` | true |
| `WFMakeGIFActionManualSizeWidth` | `Number` | — |
| `WFMakeGIFActionManualSizeHeight` | `Number` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.makegif`

## `makeVideoFromGif`

Converts an animated GIF into a video.

```chute
makeVideoFromGif(WFMakeVideoFromGIFActionLoopCount: Number, WFInputGIF: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeVideoFromGIFActionLoopCount` | `Number` | 1 |
| `WFInputGIF` | `Any` | — |

Shortcuts action: `is.workflow.actions.makevideofromgif`

## `markup`

Edits an image or PDF with Markup.

```chute
markup(WFDocument: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDocument` | `Any` | — |

Shortcuts action: `is.workflow.actions.avairyeditphoto`

## `maskImage`

Applies a mask to each image passed into the action. For example, you can cut images into a rounded rectangle, ellipse or icon shape, or provide a custom alpha mask.

```chute
maskImage(WFInput: Any, WFMaskType: Text, WFMaskCornerRadius: Number, WFCustomMaskImage: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |
| `WFMaskType` | `Text` | `"Rounded Rectangle"` |
| `WFMaskCornerRadius` | `Number` | — |
| `WFCustomMaskImage` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.mask`

## `overlayImage`

Overlays an image on top of another image.

```chute
overlayImage(WFImage: Any, WFInput: Any, WFShouldShowImageEditor: Boolean, WFImagePosition: Text, WFImageWidth: Number, WFImageHeight: Number, WFImageX: Number, WFImageY: Number, WFRotation: Number, WFOverlayImageOpacity: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | `Any` | — |
| `WFInput` | `Any` | — |
| `WFShouldShowImageEditor` | `Boolean` | true |
| `WFImagePosition` | `Text` | `"Center"` |
| `WFImageWidth` | `Number` | — |
| `WFImageHeight` | `Number` | — |
| `WFImageX` | `Number` | — |
| `WFImageY` | `Number` | — |
| `WFRotation` | `Number` | 0 |
| `WFOverlayImageOpacity` | `Number` | 100 |

Shortcuts action: `is.workflow.actions.overlayimageonimage`

## `overlayText`

Overlays text onto the image passed as input.

```chute
overlayText(WFText: Text, WFImage: Any, WFTextPosition: Text, WFTextX: Number, WFPercentageTextX: Number, WFTextY: Number, WFPercentageTextY: Number, WFTextOffset: Number, WFPercentageTextOffset: Number, WFFont: Text, WFFontSize: Number, WFPercentageFontSize: Number, WFTextAlignment: Text, WFTextColor: Text, WFTextRotation: Number, WFTextOutlineEnabled: Boolean, WFTextStrokeWidth: Number, WFPercentageTextStrokeWidth: Number, WFTextStrokeColor: Text, WFTextBoxWidth: Number, WFPercentageTextBoxWidth: Number, WFSizingMethod: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFText` | `Text` | — |
| `WFImage` | `Any` | — |
| `WFTextPosition` | `Text` | `"Center"` |
| `WFTextX` | `Number` | — |
| `WFPercentageTextX` | `Number` | — |
| `WFTextY` | `Number` | — |
| `WFPercentageTextY` | `Number` | — |
| `WFTextOffset` | `Number` | 0 |
| `WFPercentageTextOffset` | `Number` | 0.1 |
| `WFFont` | `Text` | — |
| `WFFontSize` | `Number` | 36 |
| `WFPercentageFontSize` | `Number` | 0.1 |
| `WFTextAlignment` | `Text` | `"Center"` |
| `WFTextColor` | `Text` | — |
| `WFTextRotation` | `Number` | 0 |
| `WFTextOutlineEnabled` | `Boolean` | false |
| `WFTextStrokeWidth` | `Number` | 0 |
| `WFPercentageTextStrokeWidth` | `Number` | 0.1 |
| `WFTextStrokeColor` | `Text` | — |
| `WFTextBoxWidth` | `Number` | — |
| `WFPercentageTextBoxWidth` | `Number` | 0.8 |
| `WFSizingMethod` | `Text` | `"Proportional"` |

Shortcuts action: `is.workflow.actions.overlaytext`

## `play/pause`

Plays or pauses the currently playing media.

```chute
play/pause(WFPlayPauseBehavior: Text, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlayPauseBehavior` | `Text` | `"Play/Pause"` |
| `WFMediaRoute` | `Text` | `"Local"` |

Shortcuts action: `is.workflow.actions.pausemusic`

## `playMusic`

Plays music using the Music app.

```chute
playMusic(WFMediaItems: Any, WFPlayMusicActionShuffle: Text, WFPlayMusicActionRepeat: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaItems` | `Any` | — |
| `WFPlayMusicActionShuffle` | `Text` | — |
| `WFPlayMusicActionRepeat` | `Text` | — |

Shortcuts action: `is.workflow.actions.playmusic`

## `playPodcast`

Plays a podcast using the Podcasts app. If no podcast is selected, resumes playback.

```chute
playPodcast(WFPodcastShow: Text, WFPodcastPlaybackOrder: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPodcastShow` | `Text` | — |
| `WFPodcastPlaybackOrder` | `Text` | — |

Shortcuts action: `is.workflow.actions.playpodcast`

## `playSound`

Plays the audio file passed as input, or a default notification sound if no audio file was passed.

```chute
playSound(WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.playsound`

## `recognizeMusic`

Uses the microphone to listen to and identify nearby media.

```chute
recognizeMusic(WFShazamMediaActionShowWhenRun: Boolean, WFShazamMediaActionErrorIfNotRecognized: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShazamMediaActionShowWhenRun` | `Boolean` | true |
| `WFShazamMediaActionErrorIfNotRecognized` | `Boolean` | true |

Shortcuts action: `com.apple.musicrecognition.RecognizeMusicIntent`

## `recordAudio`

Uses the microphone to record audio.

```chute
recordAudio(WFRecordingCompression: Text, WFRecordingStart: Text, WFRecordingEnd: Text, WFRecordingTimeInterval: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRecordingCompression` | `Text` | `"Normal"` |
| `WFRecordingStart` | `Text` | `"On Tap"` |
| `WFRecordingEnd` | `Text` | `"On Tap"` |
| `WFRecordingTimeInterval` | `Number` | — |

Shortcuts action: `is.workflow.actions.recordaudio`

## `removeFromPhotoAlbum`

Removes the photos or videos passed as input from the specified photo album.

```chute
removeFromPhotoAlbum(WFRemoveAlbumSelectedGroup: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRemoveAlbumSelectedGroup` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.removefromalbum`

## `removeImageBackground`

Removes the background from an image, keeping the subjects.

```chute
removeImageBackground(WFCropToBounds: Boolean, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCropToBounds` | `Boolean` | false |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.removebackground`

## `resizeImage`

Scales images to a particular width and height.

```chute
resizeImage(WFImageResizeKey: Text, WFImageResizeWidth: Number, WFImageResizeHeight: Number, WFImageResizePercentage: Number, WFImageResizeLength: Number, WFImage: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageResizeKey` | `Text` | `"Size"` |
| `WFImageResizeWidth` | `Number` | 640 |
| `WFImageResizeHeight` | `Number` | — |
| `WFImageResizePercentage` | `Number` | — |
| `WFImageResizeLength` | `Number` | — |
| `WFImage` | `Any` | — |

> If the width or height is not set, that dimension is automatically calculated to maintain the original image's aspect ratio.

Shortcuts action: `is.workflow.actions.image.resize`

## `rotateImage/video`

Turns an image or video clockwise by a particular number of degrees.

```chute
rotateImage/video(WFImageRotateAmount: Number, WFImage: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageRotateAmount` | `Number` | 90 |
| `WFImage` | `Any` | — |

Shortcuts action: `is.workflow.actions.image.rotate`

## `saveToPhotos`

Adds the photos and videos passed as input to the specified photo album.

```chute
saveToPhotos(WFCameraRollSelectedGroup: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraRollSelectedGroup` | `Text` | — |
| `WFInput` | `Any` | — |

> If a photo passed as input is already in the specified album, the photo will be duplicated.

Shortcuts action: `is.workflow.actions.savetocameraroll`

## `seek`

Seek to a specific time, or forward and backward by some duration, in the currently playing media.

```chute
seek(WFSeekBehavior: Text, WFTimeInterval: Number, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSeekBehavior` | `Text` | `"To Time"` |
| `WFTimeInterval` | `Number` | — |
| `WFMediaRoute` | `Text` | `"Local"` |

Shortcuts action: `is.workflow.actions.seek`

## `selectMusic`

Prompts to select music from your local music library.

```chute
selectMusic(WFExportSongActionSelectMultiple: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFExportSongActionSelectMultiple` | `Boolean` | — |

Shortcuts action: `is.workflow.actions.exportsong`

## `selectPhotos`

Prompts to choose photos and videos from your photo library.

```chute
selectPhotos(WFPhotoPickerTypes: Text, WFSelectMultiplePhotos: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPhotoPickerTypes` | `Text` | Images,Live Photos,Videos |
| `WFSelectMultiplePhotos` | `Boolean` | — |

Shortcuts action: `is.workflow.actions.selectphoto`

## `shazamIt`

Uses the microphone to listen to and identify nearby media.

```chute
shazamIt(WFShazamMediaActionShowWhenRun: Boolean, WFShazamMediaActionErrorIfNotRecognized: Boolean)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShazamMediaActionShowWhenRun` | `Boolean` | true |
| `WFShazamMediaActionErrorIfNotRecognized` | `Boolean` | true |

Shortcuts action: `is.workflow.actions.shazamMedia`

## `skipBack`

Skips to the previous song in the current music queue.

```chute
skipBack(WFSkipBackBehavior: Text, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSkipBackBehavior` | `Text` | `"Beginning"` |
| `WFMediaRoute` | `Text` | `"Local"` |

Shortcuts action: `is.workflow.actions.skipback`

## `skipForward`

Skips to the next song in the current music queue.

```chute
skipForward(WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaRoute` | `Text` | `"Local"` |

Shortcuts action: `is.workflow.actions.skipforward`

## `takePhoto`

Uses the camera to take photos.

```chute
takePhoto(WFCameraCaptureShowPreview: Boolean, WFPhotoCount: Number, WFCameraCaptureDevice: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraCaptureShowPreview` | `Boolean` | true |
| `WFPhotoCount` | `Number` | 1 |
| `WFCameraCaptureDevice` | `Text` | `"Back"` |

Shortcuts action: `is.workflow.actions.takephoto`

## `takeVideo`

Uses the camera to take a video clip.

```chute
takeVideo(WFCameraCaptureDevice: Text, WFCameraCaptureQuality: Text, WFRecordingStart: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraCaptureDevice` | `Text` | `"Back"` |
| `WFCameraCaptureQuality` | `Text` | `"High"` |
| `WFRecordingStart` | `Text` | `"Immediately"` |

Shortcuts action: `is.workflow.actions.takevideo`

## `trimMedia`

Presents a view allowing you to trim the media passed into the action.

```chute
trimMedia(WFInputMedia: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputMedia` | `Any` | — |

Shortcuts action: `is.workflow.actions.trimvideo`
