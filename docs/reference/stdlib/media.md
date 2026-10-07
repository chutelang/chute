# Media

Photos, video, audio, camera, and image processing.

```chute
import Media;
```

## `addFrameToGif`

Adds an image to the existing animated GIF passed as input. If no GIF is passed as input, a new animated GIF is created.

```chute
addFrameToGif(image: Image, gif: Media, delayTime: Number, autoSize: Boolean, width: Number, height: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |
| `gif` | Media | — |
| `delayTime` | Number | 0.25 |
| `autoSize` | Boolean | true |
| `width` | Number | — |
| `height` | Number | — |

Shortcuts action: `is.workflow.actions.addframetogif`

## `addToPlayingNext`

Adds the music passed as input to your Playing Next queue.

```chute
addToPlayingNext(play: Enum, music: Media)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `play` | Next \\| Later | `"Next"` |
| `music` | Media | — |

Shortcuts action: `is.workflow.actions.addmusictoupnext`

## `addToPlaylist`

Adds the items passed as input to the specified playlist.

```chute
addToPlaylist(playlist: Text, music: Any) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `playlist` | Text | — |
| `music` | Any | — |

Shortcuts action: `is.workflow.actions.addtoplaylist`

## `changePlaybackDestination`

Changes the current playback destination. Use this action to route audio to AirPods, Bluetooth speakers, HomePod, or other AirPlay devices. Optionally, this action can add or remove devices from a group, so you can route audio to multiple devices at once.

```chute
changePlaybackDestination(operation: Enum, device: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Set \\| Add \\| Remove | `"Set"` |
| `device` | Text | `"Local"` |

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
combineImages(mode: Enum, spacing: Number, images: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | Horizontally \\| Vertically \\| In a Grid | `"Horizontally"` |
| `spacing` | Number | 0 |
| `images` | Image | — |

Shortcuts action: `is.workflow.actions.image.combine`

## `convertImage`

Converts the images passed into the action to the specified image format.

```chute
convertImage(format: Text, quality: Number, preserveMetadata: Boolean, image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `format` | Text | `"JPEG"` |
| `quality` | Number | 0.75 |
| `preserveMetadata` | Boolean | true |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.image.convert`

## `createPhotoAlbum`

Creates a new album in the Photos app, including the specified photos and videos.

```chute
createPhotoAlbum(albumName: Text, photos: Any) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `albumName` | Text | — |
| `photos` | Any | — |

Shortcuts action: `is.workflow.actions.photos.createalbum`

## `createPlaylist`

Creates a new playlist in the Music app, adding any items passed as input to the new playlist.

```chute
createPlaylist(playlistName: Text, author: Text, description: Text, music: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `playlistName` | Text | — |
| `author` | Text | — |
| `description` | Text | — |
| `music` | Media | — |

Shortcuts action: `is.workflow.actions.createplaylist`

## `cropImage`

Crops images to a smaller rectangle.

```chute
cropImage(image: Image, position: Enum, xCoordinate: Number, yCoordinate: Number, width: Number, height: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |
| `position` | Center \\| Top Left \\| Top Right \\| Bottom Left \\| Bottom Right \\| Custom | `"Center"` |
| `xCoordinate` | Number | — |
| `yCoordinate` | Number | — |
| `width` | Number | 100 |
| `height` | Number | 100 |

Shortcuts action: `is.workflow.actions.image.crop`

## `deletePhotos`

Deletes the photos passed as input from the device's photo library. This action asks for confirmation before performing the deletion.

```chute
deletePhotos(photos: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `photos` | Any | — |

Shortcuts action: `is.workflow.actions.deletephotos`

## `encodeMedia`

Re-encodes the media passed as input at the specified size, optionally converting to audio.

```chute
encodeMedia(media: Media, audioOnly: Boolean, format: Enum, size: Enum, speed: Enum, preserveTransparency: Boolean, customSpeed: Number, metadata: Any, title: Text, artist: Text, album: Text, genre: Text, year: Text, artwork: Image) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `media` | Media | — |
| `audioOnly` | Boolean | false |
| `format` | M4A \\| AIFF | `"M4A"` |
| `size` | 640x480 \\| 960x540 \\| 1280x720 \\| 1920x1080 \\| 3840x2160 \\| HEVC 1920x1080 \\| HEVC 3840x2160 \\| ProRes 422 \\| Passthrough | `"Passthrough"` |
| `speed` | 0.5X \\| Normal \\| 1.5X \\| 2X \\| Custom | `"Normal"` |
| `preserveTransparency` | Boolean | false |
| `customSpeed` | Number | — |
| `metadata` | Any | — |
| `title` | Text | — |
| `artist` | Text | — |
| `album` | Text | — |
| `genre` | Text | — |
| `year` | Text | — |
| `artwork` | Image | — |

Shortcuts action: `is.workflow.actions.encodemedia`

## `findGiphyGifs`

Finds GIFs representing the provided text, using Giphy.

```chute
findGiphyGifs(search: Text, showGifPicker: Boolean, WFGiphyLimit: Number, selectMultiple: Boolean) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `search` | Text | — |
| `showGifPicker` | Boolean | true |
| `WFGiphyLimit` | Number | 1 |
| `selectMultiple` | Boolean | — |

> Powered by Giphy (giphy.com)

Shortcuts action: `is.workflow.actions.giphy`

## `findImages`

```chute
findImages(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.images`

## `findMusic`

```chute
findMusic(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Title \\| Artist \\| Album Artist \\| Album \\| Genre \\| Composer \\| Date Added \\| Duration \\| Play Count \\| Has Album Artwork \\| Album Artwork \\| Skip Count \\| Rating \\| Comments \\| Is Explicit \\| Lyrics \\| Release Date \\| Last Played Date \\| Is Cloud Item \\| Album Track Number \\| Disc Number | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.music`

## `findPhotos`

```chute
findPhotos(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.photos`

## `findPodcasts`

Finds podcasts in the Apple Podcasts catalog, returning the items that match the specified search terms.

```chute
findPodcasts(search: Text, searchBy: Text, results: Text, country: Text, WFItemLimit: Number) -> PodcastShow
```

| Parameter | Type | Default |
| --- | --- | --- |
| `search` | Text | — |
| `searchBy` | Text | — |
| `results` | Text | — |
| `country` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchpodcasts`

## `flipImage`

Reverses the direction of images either horizontally or vertically.

```chute
flipImage(direction: Enum, image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `direction` | Horizontal \\| Vertical | `"Horizontal"` |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.image.flip`

## `followPodcast`

Follows podcasts or podcast feed URLs passed into the action.

```chute
followPodcast(podcastUrl: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `podcastUrl` | Text | — |

Shortcuts action: `is.workflow.actions.podcasts.subscribe`

## `getCurrentSong`

Returns the song that is currently playing in the Music app, if any.

```chute
getCurrentSong(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Current Song \\| Current Playback Time | `"Current Song"` |

Shortcuts action: `is.workflow.actions.getcurrentsong`

## `getDetailsOfImages`

```chute
getDetailsOfImages(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Width \\| Height \\| Date Taken \\| Camera Make \\| Camera Model \\| Is a Screenshot \\| Location \\| Duration \\| Frame Rate \\| File Size \\| File Extension \\| Name \\| Album \\| Media Type \\| Photo Type \\| Time Taken \\| Metadata Dictionary \\| Is Favorite \\| Is Hidden \\| Creation Date \\| Last Modified Date | — |

Shortcuts action: `is.workflow.actions.properties.images`

## `getDetailsOfItunesArtist`

```chute
getDetailsOfItunesArtist(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Genre \\| Store URL \\| Store ID | — |

Shortcuts action: `is.workflow.actions.properties.itunesartist`

## `getDetailsOfItunesProduct`

```chute
getDetailsOfItunesProduct(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Artist \\| Price \\| Genre \\| Description \\| Store URL \\| Store ID \\| Artwork \\| Release Date \\| Duration \\| Track Count \\| Is Explicit \\| Currency Code \\| Streamable | — |

Shortcuts action: `is.workflow.actions.properties.itunesstore`

## `getDetailsOfMusic`

```chute
getDetailsOfMusic(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Title \\| Artist \\| Album Artist \\| Album \\| Genre \\| Composer \\| Date Added \\| Duration \\| Play Count \\| Has Album Artwork \\| Album Artwork \\| Skip Count \\| Rating \\| Comments \\| Is Explicit \\| Lyrics \\| Release Date \\| Last Played Date \\| Is Cloud Item \\| Album Track Number \\| Disc Number | — |

Shortcuts action: `is.workflow.actions.properties.music`

## `getDetailsOfPodcast`

```chute
getDetailsOfPodcast(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Artist \\| Feed URL \\| Genre \\| Store URL \\| Store ID \\| Artwork | — |

Shortcuts action: `is.workflow.actions.properties.podcastshow`

## `getDetailsOfPodcastEpisode`

```chute
getDetailsOfPodcastEpisode(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Feed URL \\| Episode GUID \\| Duration \\| Date \\| Has Been Played \\| Is Playing \\| Artist \\| Album \\| Store URL | — |

Shortcuts action: `is.workflow.actions.properties.podcast`

## `getDetailsOfShazam`

```chute
getDetailsOfShazam(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Artist \\| Is on Apple Music \\| Apple Music URL \\| Artwork \\| Video URL \\| Shazam URL \\| Lyrics Snippet | — |

Shortcuts action: `is.workflow.actions.properties.shazam`

## `getEpisodesOfPodcast`

Returns a list of episodes from a podcast show.

```chute
getEpisodesOfPodcast(podcast: Text) -> PodcastEpisode
```

| Parameter | Type | Default |
| --- | --- | --- |
| `podcast` | Text | — |

Shortcuts action: `is.workflow.actions.getepisodesforpodcast`

## `getFramesFromImage`

Splits an animated GIF or a photo burst into individual frames.

```chute
getFramesFromImage(image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |

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
getLatestPhotos(WFGetLatestPhotoCount: Number, includeScreenshots: Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetLatestPhotoCount` | Number | 1 |
| `includeScreenshots` | Boolean | true |

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
getPlaylist(playlist: Text) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `playlist` | Text | — |

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
handOffPlayback(source: Text, destination: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `source` | Text | — |
| `destination` | Text | — |

Shortcuts action: `is.workflow.actions.handoffplayback`

## `importAudioFilesIntoMusic`

Imports audio files into Music and compresses them with the chosen encoder.

```chute
importAudioFilesIntoMusic(audioFiles: File, reEncode: Boolean, encoder: Enum) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `audioFiles` | File | — |
| `reEncode` | Boolean | false |
| `encoder` | Default \\| AAC \\| AIFF \\| Lossless \\| MP3 \\| WAV | `"Default"` |

Shortcuts action: `is.workflow.actions.importaudiofiles`

## `makeGif`

Creates an animated GIF from the images or video passed into the action.

```chute
makeGif(secondsPerPhoto: Number, loopForever: Boolean, WFMakeGIFActionLoopCount: Number, autoSize: Boolean, width: Number, height: Number, content: Any) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `secondsPerPhoto` | Number | 0.2 |
| `loopForever` | Boolean | true |
| `WFMakeGIFActionLoopCount` | Number | — |
| `autoSize` | Boolean | true |
| `width` | Number | — |
| `height` | Number | — |
| `content` | Any | — |

Shortcuts action: `is.workflow.actions.makegif`

## `makeVideoFromGif`

Converts an animated GIF into a video.

```chute
makeVideoFromGif(WFMakeVideoFromGIFActionLoopCount: Number, image: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMakeVideoFromGIFActionLoopCount` | Number | 1 |
| `image` | Media | — |

Shortcuts action: `is.workflow.actions.makevideofromgif`

## `markup`

Edits an image or PDF with Markup.

```chute
markup(document: File) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `document` | File | — |

Shortcuts action: `is.workflow.actions.avairyeditphoto`

## `maskImage`

Applies a mask to each image passed into the action. For example, you can cut images into a rounded rectangle, ellipse or icon shape, or provide a custom alpha mask.

```chute
maskImage(image: Image, type: Enum, cornerRadius: Number, customImage: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `image` | Image | — |
| `type` | Rounded Rectangle \\| Ellipse \\| Icon \\| Custom Image | `"Rounded Rectangle"` |
| `cornerRadius` | Number | — |
| `customImage` | Image | — |

Shortcuts action: `is.workflow.actions.image.mask`

## `overlayImage`

Overlays an image on top of another image.

```chute
overlayImage(WFImage: Image, WFInput: Image, showImageEditor: Boolean, position: Enum, width: Number, height: Number, xCoordinate: Number, yCoordinate: Number, rotation(degrees): Number, opacity: Number) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFImage` | Image | — |
| `WFInput` | Image | — |
| `showImageEditor` | Boolean | true |
| `position` | Center \\| Top Left \\| Top Right \\| Bottom Left \\| Bottom Right \\| Custom | `"Center"` |
| `width` | Number | — |
| `height` | Number | — |
| `xCoordinate` | Number | — |
| `yCoordinate` | Number | — |
| `rotation(degrees)` | Number | 0 |
| `opacity` | Number | 100 |

Shortcuts action: `is.workflow.actions.overlayimageonimage`

## `overlayText`

Overlays text onto the image passed as input.

```chute
overlayText(text: Text, image: Image, position: Enum, WFTextX: Number, WFPercentageTextX: Number, WFTextY: Number, WFPercentageTextY: Number, WFTextOffset: Number, WFPercentageTextOffset: Number, font: Text, WFFontSize: Number, WFPercentageFontSize: Number, textAlignment: Enum, fontColor: Text, rotation: Number, outlineText: Boolean, WFTextStrokeWidth: Number, WFPercentageTextStrokeWidth: Number, strokeColor: Text, WFTextBoxWidth: Number, WFPercentageTextBoxWidth: Number, sizing: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `text` | Text | — |
| `image` | Image | — |
| `position` | Top Left \\| Top Center \\| Top Right \\| Middle Left \\| Center \\| Middle Right \\| Bottom Left \\| Bottom Center \\| Bottom Right \\| Custom Position | `"Center"` |
| `WFTextX` | Number | — |
| `WFPercentageTextX` | Number | — |
| `WFTextY` | Number | — |
| `WFPercentageTextY` | Number | — |
| `WFTextOffset` | Number | 0 |
| `WFPercentageTextOffset` | Number | 0.1 |
| `font` | Text | — |
| `WFFontSize` | Number | 36 |
| `WFPercentageFontSize` | Number | 0.1 |
| `textAlignment` | Left \\| Center \\| Right | `"Center"` |
| `fontColor` | Text | — |
| `rotation` | Number | 0 |
| `outlineText` | Boolean | false |
| `WFTextStrokeWidth` | Number | 0 |
| `WFPercentageTextStrokeWidth` | Number | 0.1 |
| `strokeColor` | Text | — |
| `WFTextBoxWidth` | Number | — |
| `WFPercentageTextBoxWidth` | Number | 0.8 |
| `sizing` | Proportional \\| Absolute | `"Proportional"` |

Shortcuts action: `is.workflow.actions.overlaytext`

## `playMusic`

Plays music using the Music app.

```chute
playMusic(music: Media, shuffle: Enum, repeat: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `music` | Media | — |
| `shuffle` | Off \\| Songs | — |
| `repeat` | None \\| One \\| All | — |

Shortcuts action: `is.workflow.actions.playmusic`

## `playPause`

Plays or pauses the currently playing media.

```chute
playPause(playPause: Enum, device: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `playPause` | Play/Pause \\| Play \\| Pause | `"Play/Pause"` |
| `device` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.pausemusic`

## `playPodcast`

Plays a podcast using the Podcasts app. If no podcast is selected, resumes playback.

```chute
playPodcast(podcast: Text, playbackOrder: Enum)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `podcast` | Text | — |
| `playbackOrder` | Default \\| Newest First \\| Oldest First | — |

Shortcuts action: `is.workflow.actions.playpodcast`

## `playSound`

Plays the audio file passed as input, or a default notification sound if no audio file was passed.

```chute
playSound(soundFile: Media)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `soundFile` | Media | — |

Shortcuts action: `is.workflow.actions.playsound`

## `quickConvertImage`

```chute
quickConvertImage(preserveMetadata: Boolean, image: Image, fileFormat: Enum, imageSize: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `preserveMetadata` | Boolean | — |
| `image` | Image | — |
| `fileFormat` | JPEG \\| PNG \\| HEIF | `"JPEG"` |
| `imageSize` | Small \\| Medium \\| Large \\| Original | `"Small"` |

Shortcuts action: `is.workflow.actions.image.convert.finder`

## `recognizeMusic`

Uses the microphone to listen to and identify nearby media.

```chute
recognizeMusic(showWhenRun: Boolean, errorIfNotRecognized: Boolean) -> ShazamMedia
```

| Parameter | Type | Default |
| --- | --- | --- |
| `showWhenRun` | Boolean | true |
| `errorIfNotRecognized` | Boolean | true |

Shortcuts action: `com.apple.musicrecognition.RecognizeMusicIntent`

## `recordAudio`

Uses the microphone to record audio.

```chute
recordAudio(audioQuality: Enum, startRecording: Enum, finishRecording: Enum, duration: Number) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `audioQuality` | Normal \\| Very High | `"Normal"` |
| `startRecording` | On Tap \\| Immediately | `"On Tap"` |
| `finishRecording` | On Tap \\| After Time | `"On Tap"` |
| `duration` | Number | — |

Shortcuts action: `is.workflow.actions.recordaudio`

## `removeFromPhotoAlbum`

Removes the photos or videos passed as input from the specified photo album.

```chute
removeFromPhotoAlbum(album: Text, input: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `album` | Text | — |
| `input` | Image | — |

Shortcuts action: `is.workflow.actions.removefromalbum`

## `removeImageBackground`

Removes the background from an image, keeping the subjects.

```chute
removeImageBackground(crop: Boolean, image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `crop` | Boolean | false |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.image.removebackground`

## `resizeImage`

Scales images to a particular width and height.

```chute
resizeImage(by: Enum, width: Number, height: Number, percentage: Number, longestEdgeSize: Number, image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `by` | Size \\| Percentage \\| Longest Edge | `"Size"` |
| `width` | Number | 640 |
| `height` | Number | — |
| `percentage` | Number | — |
| `longestEdgeSize` | Number | — |
| `image` | Image | — |

> If the width or height is not set, that dimension is automatically calculated to maintain the original image's aspect ratio.

Shortcuts action: `is.workflow.actions.image.resize`

## `rotateImageVideo`

Turns an image or video clockwise by a particular number of degrees.

```chute
rotateImageVideo(degrees: Number, image: Image) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `degrees` | Number | 90 |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.image.rotate`

## `saveToPhotos`

Adds the photos and videos passed as input to the specified photo album.

```chute
saveToPhotos(album: Text, input: Any) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `album` | Text | — |
| `input` | Any | — |

> If a photo passed as input is already in the specified album, the photo will be duplicated.

Shortcuts action: `is.workflow.actions.savetocameraroll`

## `seek`

Seek to a specific time, or forward and backward by some duration, in the currently playing media.

```chute
seek(seekType: Enum, timeInterval: Number, device: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `seekType` | To Time \\| Forward By \\| Backward By | `"To Time"` |
| `timeInterval` | Number | — |
| `device` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.seek`

## `selectMusic`

Prompts to select music from your local music library.

```chute
selectMusic(selectMultipleSongs: Boolean) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `selectMultipleSongs` | Boolean | — |

Shortcuts action: `is.workflow.actions.exportsong`

## `selectPhotos`

Prompts to choose photos and videos from your photo library.

```chute
selectPhotos(include: Enum, selectMultiple: Boolean) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `include` | Images \\| Live Photos \\| Videos | Images,Live Photos,Videos |
| `selectMultiple` | Boolean | — |

Shortcuts action: `is.workflow.actions.selectphoto`

## `skipBack`

Skips to the previous song in the current music queue.

```chute
skipBack(skipTo: Enum, device: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `skipTo` | Beginning \\| Previous Song | `"Beginning"` |
| `device` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.skipback`

## `skipForward`

Skips to the next song in the current music queue.

```chute
skipForward(device: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `device` | Text | `"Local"` |

Shortcuts action: `is.workflow.actions.skipforward`

## `takePhoto`

Uses the camera to take photos.

```chute
takePhoto(showCameraPreview: Boolean, WFPhotoCount: Number, camera: Enum) -> Image
```

| Parameter | Type | Default |
| --- | --- | --- |
| `showCameraPreview` | Boolean | true |
| `WFPhotoCount` | Number | 1 |
| `camera` | Front \\| Back | `"Back"` |

Shortcuts action: `is.workflow.actions.takephoto`

## `takeVideo`

Uses the camera to take a video clip.

```chute
takeVideo(camera: Enum, quality: Enum, startRecording: Enum) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `camera` | Front \\| Back | `"Back"` |
| `quality` | Low \\| Medium \\| High | `"High"` |
| `startRecording` | On Tap \\| Immediately | `"Immediately"` |

Shortcuts action: `is.workflow.actions.takevideo`

## `trimMedia`

Presents a view allowing you to trim the media passed into the action.

```chute
trimMedia(media: Media) -> Media
```

| Parameter | Type | Default |
| --- | --- | --- |
| `media` | Media | — |

Shortcuts action: `is.workflow.actions.trimvideo`
