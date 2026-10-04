# Media

Photos, video, audio, camera, and image processing.

```chute
import Media;
```

## `addFrameToGif`

Adds an image to the existing animated GIF passed as input. If no GIF is passed as input, a new animated GIF is created.

```chute
addFrameToGif(WFImage: Image, WFInputGIF: Media, WFGIFDelayTime: Number, WFGIFAutoSize: Boolean, WFGIFManualSizeWidth: Number, WFGIFManualSizeHeight: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | Image | — |
| `WFInputGIF` | Media | — |
| `WFGIFDelayTime` | Number | 0.25 |
| `WFGIFAutoSize` | Boolean | true |
| `WFGIFManualSizeWidth` | Number | — |
| `WFGIFManualSizeHeight` | Number | — |

Shortcuts action: `is.workflow.actions.addframetogif`

## `addToPlayingNext`

Adds the music passed as input to your Playing Next queue.

```chute
addToPlayingNext(WFWhenToPlay: Enum, WFMusic: Media)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWhenToPlay` | Next \\| Later | `"Next"` |
| `WFMusic` | Media | — |

Shortcuts action: `is.workflow.actions.addmusictoupnext`

## `addToPlaylist`

Adds the items passed as input to the specified playlist.

```chute
addToPlaylist(WFPlaylistName: Text, WFInput: Any) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | Text | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.addtoplaylist`

## `changePlaybackDestination`

Changes the current playback destination. Use this action to route audio to AirPods, Bluetooth speakers, HomePod, or other AirPlay devices. Optionally, this action can add or remove devices from a group, so you can route audio to multiple devices at once.

```chute
changePlaybackDestination(WFMediaRouteOperation: Enum, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaRouteOperation` | Set \\| Add \\| Remove | `"Set"` |
| `WFMediaRoute` | Text | `"Local"` |

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
combineImages(WFImageCombineMode: Enum, WFImageCombineSpacing: Number, WFInput: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageCombineMode` | Horizontally \\| Vertically \\| In a Grid | `"Horizontally"` |
| `WFImageCombineSpacing` | Number | 0 |
| `WFInput` | Image | — |

Shortcuts action: `is.workflow.actions.image.combine`

## `convertImage`

Converts the images passed into the action to the specified image format.

```chute
convertImage(WFImageFormat: Text, WFImageCompressionQuality: Number, WFImagePreserveMetadata: Boolean, WFInput: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageFormat` | Text | `"JPEG"` |
| `WFImageCompressionQuality` | Number | 0.75 |
| `WFImagePreserveMetadata` | Boolean | true |
| `WFInput` | Image | — |

Shortcuts action: `is.workflow.actions.image.convert`

## `createPhotoAlbum`

Creates a new album in the Photos app, including the specified photos and videos.

```chute
createPhotoAlbum(AlbumName: Text, WFInput: Any) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `AlbumName` | Text | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.photos.createalbum`

## `createPlaylist`

Creates a new playlist in the Music app, adding any items passed as input to the new playlist.

```chute
createPlaylist(WFPlaylistName: Text, WFPlaylistAuthor: Text, WFPlaylistDescription: Text, WFPlaylistItems: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | Text | — |
| `WFPlaylistAuthor` | Text | — |
| `WFPlaylistDescription` | Text | — |
| `WFPlaylistItems` | Media | — |

Shortcuts action: `is.workflow.actions.createplaylist`

## `cropImage`

Crops images to a smaller rectangle.

```chute
cropImage(WFInput: Image, WFImageCropPosition: Enum, WFImageCropX: Number, WFImageCropY: Number, WFImageCropWidth: Number, WFImageCropHeight: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Image | — |
| `WFImageCropPosition` | Center \\| Top Left \\| Top Right \\| Bottom Left \\| Bottom Right \\| Custom | `"Center"` |
| `WFImageCropX` | Number | — |
| `WFImageCropY` | Number | — |
| `WFImageCropWidth` | Number | 100 |
| `WFImageCropHeight` | Number | 100 |

Shortcuts action: `is.workflow.actions.image.crop`

## `deletePhotos`

Deletes the photos passed as input from the device's photo library. This action asks for confirmation before performing the deletion.

```chute
deletePhotos(photos: Any, assetIdentifiers: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `photos` | Any | — |
| `assetIdentifiers` | Any | — |

Shortcuts action: `is.workflow.actions.deletephotos`

## `encodeMedia`

Re-encodes the media passed as input at the specified size, optionally converting to audio.

```chute
encodeMedia(WFMedia: Media, WFMediaAudioOnly: Boolean, WFMediaAudioFormat: Enum, WFMediaSize: Enum, WFMediaSpeed: Enum, WFMediaPreserveTransparency: Boolean, WFMediaCustomSpeed: Number, Metadata: Any, WFMetadataTitle: Text, WFMetadataArtist: Text, WFMetadataAlbum: Text, WFMetadataGenre: Text, WFMetadataYear: Text, WFMetadataArtwork: Image) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMedia` | Media | — |
| `WFMediaAudioOnly` | Boolean | false |
| `WFMediaAudioFormat` | M4A \\| AIFF | `"M4A"` |
| `WFMediaSize` | 640x480 \\| 960x540 \\| 1280x720 \\| 1920x1080 \\| 3840x2160 \\| HEVC 1920x1080 \\| HEVC 3840x2160 \\| ProRes 422 \\| Passthrough | `"Passthrough"` |
| `WFMediaSpeed` | 0.5X \\| Normal \\| 1.5X \\| 2X \\| Custom | `"Normal"` |
| `WFMediaPreserveTransparency` | Boolean | false |
| `WFMediaCustomSpeed` | Number | — |
| `Metadata` | Any | — |
| `WFMetadataTitle` | Text | — |
| `WFMetadataArtist` | Text | — |
| `WFMetadataAlbum` | Text | — |
| `WFMetadataGenre` | Text | — |
| `WFMetadataYear` | Text | — |
| `WFMetadataArtwork` | Image | — |

Shortcuts action: `is.workflow.actions.encodemedia`

## `filterImages`

```chute
filterImages(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.images`

## `finderConvertImage`

```chute
finderConvertImage(WFPreserveMetadata: Boolean, WFImage: Image, WFFileFormat: Enum, WFSize: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPreserveMetadata` | Boolean | — |
| `WFImage` | Image | — |
| `WFFileFormat` | JPEG \\| PNG \\| HEIF | `"JPEG"` |
| `WFSize` | Small \\| Medium \\| Large \\| Original | `"Small"` |

Shortcuts action: `is.workflow.actions.image.convert.finder`

## `findGiphyGifs`

Finds GIFs representing the provided text, using Giphy.

```chute
findGiphyGifs(WFGiphyQuery: Text, WFGiphyShowPicker: Boolean, WFGiphyLimit: Number, WFGiphySelectMultiple: Boolean) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGiphyQuery` | Text | — |
| `WFGiphyShowPicker` | Boolean | true |
| `WFGiphyLimit` | Number | 1 |
| `WFGiphySelectMultiple` | Boolean | — |

> Powered by Giphy (giphy.com)

Shortcuts action: `is.workflow.actions.giphy`

## `findMusic`

```chute
findMusic(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Title \\| Artist \\| Album Artist \\| Album \\| Genre \\| Composer \\| Date Added \\| Duration \\| Play Count \\| Has Album Artwork \\| Album Artwork \\| Skip Count \\| Rating \\| Comments \\| Is Explicit \\| Lyrics \\| Release Date \\| Last Played Date \\| Is Cloud Item \\| Album Track Number \\| Disc Number | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.music`

## `findPhotos`

```chute
findPhotos(WFContentItemSortProperty: Enum, WFContentItemSortOrder: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemSortProperty` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |
| `WFContentItemSortOrder` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.photos`

## `findPodcasts`

Finds podcasts in the Apple Podcasts catalog, returning the items that match the specified search terms.

```chute
findPodcasts(WFSearchTerm: Text, WFAttribute: Text, WFEntity: Text, WFCountry: Text, WFItemLimit: Number) -> PodcastShow
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | Text | — |
| `WFAttribute` | Text | — |
| `WFEntity` | Text | — |
| `WFCountry` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchpodcasts`

## `flipImage`

Reverses the direction of images either horizontally or vertically.

```chute
flipImage(WFImageFlipDirection: Enum, WFInput: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageFlipDirection` | Horizontal \\| Vertical | `"Horizontal"` |
| `WFInput` | Image | — |

Shortcuts action: `is.workflow.actions.image.flip`

## `followPodcast`

Follows podcasts or podcast feed URLs passed into the action.

```chute
followPodcast(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.podcasts.subscribe`

## `getCurrentSong`

Returns the song that is currently playing in the Music app, if any.

```chute
getCurrentSong(Subject: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Subject` | Current Song \\| Current Playback Time | `"Current Song"` |

Shortcuts action: `is.workflow.actions.getcurrentsong`

## `getDetailsOfImages`

```chute
getDetailsOfImages(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |

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
getDetailsOfMusic(WFContentItemPropertyName: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFContentItemPropertyName` | Title \\| Artist \\| Album Artist \\| Album \\| Genre \\| Composer \\| Date Added \\| Duration \\| Play Count \\| Has Album Artwork \\| Album Artwork \\| Skip Count \\| Rating \\| Comments \\| Is Explicit \\| Lyrics \\| Release Date \\| Last Played Date \\| Is Cloud Item \\| Album Track Number \\| Disc Number | — |

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
getEpisodesOfPodcast(WFInput: Text) -> PodcastEpisode
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.getepisodesforpodcast`

## `getFramesFromImage`

Splits an animated GIF or a photo burst into individual frames.

```chute
getFramesFromImage(WFImage: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | Image | — |

Shortcuts action: `is.workflow.actions.getframesfromimage`

## `getLastImport`

Gets the most recent photo import from the Photos app.

```chute
getLastImport() -> Image
```

Shortcuts action: `is.workflow.actions.getlatestphotoimport`

## `getLatestBursts`

Gets the most recent burst photos from the photo library.

```chute
getLatestBursts(WFGetLatestPhotoCount: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getlatestbursts`

## `getLatestLivePhotos`

Gets the most recent Live Photos from the photo library.

```chute
getLatestLivePhotos(WFGetLatestPhotoCount: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getlatestlivephotos`

## `getLatestPhotos`

Gets the most recent photos from the photo library.

```chute
getLatestPhotos(WFGetLatestPhotoCount: Number, WFGetLatestPhotosActionIncludeScreenshots: Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |
| `WFGetLatestPhotosActionIncludeScreenshots` | Boolean | true |

Shortcuts action: `is.workflow.actions.getlastphoto`

## `getLatestScreenshots`

Gets the most recent screenshots from the photo library.

```chute
getLatestScreenshots(WFGetLatestPhotoCount: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getlastscreenshot`

## `getLatestVideos`

Gets the most recent videos from the photo library.

```chute
getLatestVideos(WFGetLatestPhotoCount: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |

Shortcuts action: `is.workflow.actions.getlastvideo`

## `getPlaylist`

Gets every song in the specified playlist.

```chute
getPlaylist(WFPlaylistName: Text) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlaylistName` | Text | — |

Shortcuts action: `is.workflow.actions.get.playlist`

## `getPodcastsFromLibrary`

Gets a list of all shows in your Podcast library.

```chute
getPodcastsFromLibrary() -> PodcastShow
```

Shortcuts action: `is.workflow.actions.getpodcastsfromlibrary`

## `handOffPlayback`

Hands off Music or Podcasts playback between two devices.

```chute
handOffPlayback(WFSourceMediaRoute: Text, WFDestinationMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSourceMediaRoute` | Text | — |
| `WFDestinationMediaRoute` | Text | — |

Shortcuts action: `is.workflow.actions.handoffplayback`

## `importAudioFilesIntoMusic`

Imports audio files into Music and compresses them with the chosen encoder.

```chute
importAudioFilesIntoMusic(WFInput: File, WFImportAudioFilesReencode: Boolean, WFImportAudioFilesEncoder: Enum) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | File | — |
| `WFImportAudioFilesReencode` | Boolean | false |
| `WFImportAudioFilesEncoder` | Default \\| AAC \\| AIFF \\| Lossless \\| MP3 \\| WAV | `"Default"` |

Shortcuts action: `is.workflow.actions.importaudiofiles`

## `makeGif`

Creates an animated GIF from the images or video passed into the action.

```chute
makeGif(WFMakeGIFActionDelayTime: Number, WFMakeGIFActionLoopEnabled: Boolean, WFMakeGIFActionLoopCount: Number, WFMakeGIFActionAutoSize: Boolean, WFMakeGIFActionManualSizeWidth: Number, WFMakeGIFActionManualSizeHeight: Number, WFInput: Any) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeGIFActionDelayTime` | Number | 0.2 |
| `WFMakeGIFActionLoopEnabled` | Boolean | true |
| `WFMakeGIFActionLoopCount` | Number | — |
| `WFMakeGIFActionAutoSize` | Boolean | true |
| `WFMakeGIFActionManualSizeWidth` | Number | — |
| `WFMakeGIFActionManualSizeHeight` | Number | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.makegif`

## `makeVideoFromGif`

Converts an animated GIF into a video.

```chute
makeVideoFromGif(WFMakeVideoFromGIFActionLoopCount: Number, WFInputGIF: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeVideoFromGIFActionLoopCount` | Number | 1 |
| `WFInputGIF` | Media | — |

Shortcuts action: `is.workflow.actions.makevideofromgif`

## `markup`

Edits an image or PDF with Markup.

```chute
markup(WFDocument: File) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFDocument` | File | — |

Shortcuts action: `is.workflow.actions.avairyeditphoto`

## `maskImage`

Applies a mask to each image passed into the action. For example, you can cut images into a rounded rectangle, ellipse or icon shape, or provide a custom alpha mask.

```chute
maskImage(WFInput: Image, WFMaskType: Enum, WFMaskCornerRadius: Number, WFCustomMaskImage: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Image | — |
| `WFMaskType` | Rounded Rectangle \\| Ellipse \\| Icon \\| Custom Image | `"Rounded Rectangle"` |
| `WFMaskCornerRadius` | Number | — |
| `WFCustomMaskImage` | Image | — |

Shortcuts action: `is.workflow.actions.image.mask`

## `overlayImage`

Overlays an image on top of another image.

```chute
overlayImage(WFImage: Image, WFInput: Image, WFShouldShowImageEditor: Boolean, WFImagePosition: Enum, WFImageWidth: Number, WFImageHeight: Number, WFImageX: Number, WFImageY: Number, WFRotation: Number, WFOverlayImageOpacity: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | Image | — |
| `WFInput` | Image | — |
| `WFShouldShowImageEditor` | Boolean | true |
| `WFImagePosition` | Center \\| Top Left \\| Top Right \\| Bottom Left \\| Bottom Right \\| Custom | `"Center"` |
| `WFImageWidth` | Number | — |
| `WFImageHeight` | Number | — |
| `WFImageX` | Number | — |
| `WFImageY` | Number | — |
| `WFRotation` | Number | 0 |
| `WFOverlayImageOpacity` | Number | 100 |

Shortcuts action: `is.workflow.actions.overlayimageonimage`

## `overlayText`

Overlays text onto the image passed as input.

```chute
overlayText(WFText: Text, WFImage: Image, WFTextPosition: Enum, WFTextX: Number, WFPercentageTextX: Number, WFTextY: Number, WFPercentageTextY: Number, WFTextOffset: Number, WFPercentageTextOffset: Number, WFFont: Text, WFFontSize: Number, WFPercentageFontSize: Number, WFTextAlignment: Enum, WFTextColor: Text, WFTextRotation: Number, WFTextOutlineEnabled: Boolean, WFTextStrokeWidth: Number, WFPercentageTextStrokeWidth: Number, WFTextStrokeColor: Text, WFTextBoxWidth: Number, WFPercentageTextBoxWidth: Number, WFSizingMethod: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFText` | Text | — |
| `WFImage` | Image | — |
| `WFTextPosition` | Top Left \\| Top Center \\| Top Right \\| Middle Left \\| Center \\| Middle Right \\| Bottom Left \\| Bottom Center \\| Bottom Right \\| Custom Position | `"Center"` |
| `WFTextX` | Number | — |
| `WFPercentageTextX` | Number | — |
| `WFTextY` | Number | — |
| `WFPercentageTextY` | Number | — |
| `WFTextOffset` | Number | 0 |
| `WFPercentageTextOffset` | Number | 0.1 |
| `WFFont` | Text | — |
| `WFFontSize` | Number | 36 |
| `WFPercentageFontSize` | Number | 0.1 |
| `WFTextAlignment` | Left \\| Center \\| Right | `"Center"` |
| `WFTextColor` | Text | — |
| `WFTextRotation` | Number | 0 |
| `WFTextOutlineEnabled` | Boolean | false |
| `WFTextStrokeWidth` | Number | 0 |
| `WFPercentageTextStrokeWidth` | Number | 0.1 |
| `WFTextStrokeColor` | Text | — |
| `WFTextBoxWidth` | Number | — |
| `WFPercentageTextBoxWidth` | Number | 0.8 |
| `WFSizingMethod` | Proportional \\| Absolute | `"Proportional"` |

Shortcuts action: `is.workflow.actions.overlaytext`

## `play/pause`

Plays or pauses the currently playing media.

```chute
play/pause(WFPlayPauseBehavior: Enum, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPlayPauseBehavior` | Play/Pause \\| Play \\| Pause | `"Play/Pause"` |
| `WFMediaRoute` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.pausemusic`

## `playMusic`

Plays music using the Music app.

```chute
playMusic(WFMediaItems: Media, WFPlayMusicActionShuffle: Enum, WFPlayMusicActionRepeat: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaItems` | Media | — |
| `WFPlayMusicActionShuffle` | Off \\| Songs | — |
| `WFPlayMusicActionRepeat` | None \\| One \\| All | — |

Shortcuts action: `is.workflow.actions.playmusic`

## `playPodcast`

Plays a podcast using the Podcasts app. If no podcast is selected, resumes playback.

```chute
playPodcast(WFPodcastShow: Text, WFPodcastPlaybackOrder: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPodcastShow` | Text | — |
| `WFPodcastPlaybackOrder` | Default \\| Newest First \\| Oldest First | — |

Shortcuts action: `is.workflow.actions.playpodcast`

## `playSound`

Plays the audio file passed as input, or a default notification sound if no audio file was passed.

```chute
playSound(WFInput: Media)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Media | — |

Shortcuts action: `is.workflow.actions.playsound`

## `recognizeMusic`

Uses the microphone to listen to and identify nearby media.

```chute
recognizeMusic(WFShazamMediaActionShowWhenRun: Boolean, WFShazamMediaActionErrorIfNotRecognized: Boolean) -> ShazamMedia
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShazamMediaActionShowWhenRun` | Boolean | true |
| `WFShazamMediaActionErrorIfNotRecognized` | Boolean | true |

Shortcuts action: `com.apple.musicrecognition.RecognizeMusicIntent`

## `recordAudio`

Uses the microphone to record audio.

```chute
recordAudio(WFRecordingCompression: Enum, WFRecordingStart: Enum, WFRecordingEnd: Enum, WFRecordingTimeInterval: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRecordingCompression` | Normal \\| Very High | `"Normal"` |
| `WFRecordingStart` | On Tap \\| Immediately | `"On Tap"` |
| `WFRecordingEnd` | On Tap \\| After Time | `"On Tap"` |
| `WFRecordingTimeInterval` | Number | — |

Shortcuts action: `is.workflow.actions.recordaudio`

## `removeFromPhotoAlbum`

Removes the photos or videos passed as input from the specified photo album.

```chute
removeFromPhotoAlbum(WFRemoveAlbumSelectedGroup: Text, WFInput: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRemoveAlbumSelectedGroup` | Text | — |
| `WFInput` | Image | — |

Shortcuts action: `is.workflow.actions.removefromalbum`

## `removeImageBackground`

Removes the background from an image, keeping the subjects.

```chute
removeImageBackground(WFCropToBounds: Boolean, WFInput: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCropToBounds` | Boolean | false |
| `WFInput` | Image | — |

Shortcuts action: `is.workflow.actions.image.removebackground`

## `resizeImage`

Scales images to a particular width and height.

```chute
resizeImage(WFImageResizeKey: Enum, WFImageResizeWidth: Number, WFImageResizeHeight: Number, WFImageResizePercentage: Number, WFImageResizeLength: Number, WFImage: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageResizeKey` | Size \\| Percentage \\| Longest Edge | `"Size"` |
| `WFImageResizeWidth` | Number | 640 |
| `WFImageResizeHeight` | Number | — |
| `WFImageResizePercentage` | Number | — |
| `WFImageResizeLength` | Number | — |
| `WFImage` | Image | — |

> If the width or height is not set, that dimension is automatically calculated to maintain the original image's aspect ratio.

Shortcuts action: `is.workflow.actions.image.resize`

## `rotateImage/video`

Turns an image or video clockwise by a particular number of degrees.

```chute
rotateImage/video(WFImageRotateAmount: Number, WFImage: Image) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImageRotateAmount` | Number | 90 |
| `WFImage` | Image | — |

Shortcuts action: `is.workflow.actions.image.rotate`

## `saveToPhotos`

Adds the photos and videos passed as input to the specified photo album.

```chute
saveToPhotos(WFCameraRollSelectedGroup: Text, WFInput: Any) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraRollSelectedGroup` | Text | — |
| `WFInput` | Any | — |

> If a photo passed as input is already in the specified album, the photo will be duplicated.

Shortcuts action: `is.workflow.actions.savetocameraroll`

## `seek`

Seek to a specific time, or forward and backward by some duration, in the currently playing media.

```chute
seek(WFSeekBehavior: Enum, WFTimeInterval: Number, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSeekBehavior` | To Time \\| Forward By \\| Backward By | `"To Time"` |
| `WFTimeInterval` | Number | — |
| `WFMediaRoute` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.seek`

## `selectMusic`

Prompts to select music from your local music library.

```chute
selectMusic(WFExportSongActionSelectMultiple: Boolean) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFExportSongActionSelectMultiple` | Boolean | — |

Shortcuts action: `is.workflow.actions.exportsong`

## `selectPhotos`

Prompts to choose photos and videos from your photo library.

```chute
selectPhotos(WFPhotoPickerTypes: Enum, WFSelectMultiplePhotos: Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFPhotoPickerTypes` | Images \\| Live Photos \\| Videos | Images,Live Photos,Videos |
| `WFSelectMultiplePhotos` | Boolean | — |

Shortcuts action: `is.workflow.actions.selectphoto`

## `shazamIt`

Uses the microphone to listen to and identify nearby media.

```chute
shazamIt(WFShazamMediaActionShowWhenRun: Boolean, WFShazamMediaActionErrorIfNotRecognized: Boolean) -> ShazamMedia
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFShazamMediaActionShowWhenRun` | Boolean | true |
| `WFShazamMediaActionErrorIfNotRecognized` | Boolean | true |

Shortcuts action: `is.workflow.actions.shazamMedia`

## `skipBack`

Skips to the previous song in the current music queue.

```chute
skipBack(WFSkipBackBehavior: Enum, WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSkipBackBehavior` | Beginning \\| Previous Song | `"Beginning"` |
| `WFMediaRoute` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.skipback`

## `skipForward`

Skips to the next song in the current music queue.

```chute
skipForward(WFMediaRoute: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMediaRoute` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.skipforward`

## `takePhoto`

Uses the camera to take photos.

```chute
takePhoto(WFCameraCaptureShowPreview: Boolean, WFPhotoCount: Number, WFCameraCaptureDevice: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraCaptureShowPreview` | Boolean | true |
| `WFPhotoCount` | Number | 1 |
| `WFCameraCaptureDevice` | Front \\| Back | `"Back"` |

Shortcuts action: `is.workflow.actions.takephoto`

## `takeVideo`

Uses the camera to take a video clip.

```chute
takeVideo(WFCameraCaptureDevice: Enum, WFCameraCaptureQuality: Enum, WFRecordingStart: Enum) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFCameraCaptureDevice` | Front \\| Back | `"Back"` |
| `WFCameraCaptureQuality` | Low \\| Medium \\| High | `"High"` |
| `WFRecordingStart` | On Tap \\| Immediately | `"Immediately"` |

Shortcuts action: `is.workflow.actions.takevideo`

## `trimMedia`

Presents a view allowing you to trim the media passed into the action.

```chute
trimMedia(WFInputMedia: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInputMedia` | Media | — |

Shortcuts action: `is.workflow.actions.trimvideo`
