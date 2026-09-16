# Web

URLs, HTTP requests, web pages, and RSS.

```chute
import Web;
```

## `addToReadingList`

Adds URLs passed into the action to your reading list.

```chute
addToReadingList(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | Text | — |

Shortcuts action: `is.workflow.actions.readinglist`

## `expandUrl`

This action expands and cleans up URLs which have been shortened using a URL shortening service like TinyURL or Bit.ly.

```chute
expandUrl(Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `URL` | Text | — |

> The expanded URL is cleaned, removing unnecessary parameters such as "utm_source".

Shortcuts action: `is.workflow.actions.url.expand`

## `filterArticles`

```chute
filterArticles()
```

Shortcuts action: `is.workflow.actions.filter.articles`

## `findAppStoreApps`

Searches the App Store, returning the apps that match the specified search terms. You can get more details about the results using the Get Details of App Store App action.

```chute
findAppStoreApps(Text, Text, Text, Text, Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | Text | — |
| `WFAttribute` | Text | — |
| `WFEntity` | Text | — |
| `WFCountry` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchappstore`

## `findItunesStoreItems`

Searches the iTunes Store, returning the items that match the specified search terms. You can get more details about the results using the Get Details of iTunes Product action.

```chute
findItunesStoreItems(Text, Text, Text, Text, Text, Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | Text | — |
| `WFMediaType` | Text | — |
| `WFAttribute` | Text | — |
| `WFEntity` | Text | — |
| `WFCountry` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchitunes`

## `getArticleUsingSafariReader`

Gets article details, including body text, author, publish date, and more, from every URL passed into the action.

```chute
getArticleUsingSafariReader(Text) -> Article
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWebPage` | Text | — |

> Use a Get Details of Article action immediately after this action to get specific details about the article. This action only supports getting one article from each URL.

Shortcuts action: `is.workflow.actions.getarticle`

## `getComponentOfUrl`

Gets the specified part of the URL passed into the action.

```chute
getComponentOfUrl(Text, Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | Text | — |
| `WFURLComponent` | Scheme \| User \| Password \| Host \| Port \| Path \| Query \| Fragment | `"Scheme"` |

> URLs are structured as follows: scheme://user:password@host:port/path?query#fragment

Shortcuts action: `is.workflow.actions.geturlcomponent`

## `getContentsOfUrl`

Gets the contents of URLs passed into the action. Useful for downloading files and web content, or for making API requests.

```chute
getContentsOfUrl(Text, Enum, Any, Dictionary, Enum, Dictionary, Dictionary, Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | Text | — |
| `WFHTTPMethod` | GET \| POST \| PUT \| PATCH \| DELETE | `"GET"` |
| `ShowHeaders` | Any | — |
| `WFHTTPHeaders` | Dictionary | — |
| `WFHTTPBodyType` | JSON \| Form \| File | `"JSON"` |
| `WFFormValues` | Dictionary | — |
| `WFJSONValues` | Dictionary | — |
| `WFRequestVariable` | Any | — |

> To make a multipart HTTP request, choose "Form" as the request body type and add files as field values.

Shortcuts action: `is.workflow.actions.downloadurl`

## `getContentsOfWebPage`

Extracts the contents of the web pages passed into the action.

```chute
getContentsOfWebPage(Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.getwebpagecontents`

## `getCurrentWebPageFromSafari`

Gets the web page of the frontmost Safari window.

```chute
getCurrentWebPageFromSafari() -> Any
```

Shortcuts action: `is.workflow.actions.safari.geturl`

## `getDetailsOfArticle`

```chute
getDetailsOfArticle()
```

Shortcuts action: `is.workflow.actions.properties.articles`

## `getDetailsOfSafariWebPage`

```chute
getDetailsOfSafariWebPage()
```

> Safari Web Page items are only available when running your shortcut as an Action Extension in Safari.

Shortcuts action: `is.workflow.actions.properties.safariwebpage`

## `getHeadersOfUrl`

Retrieves the HTTP headers of the URL passed as input using a HEAD request.

```chute
getHeadersOfUrl(Text) -> Dictionary
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.url.getheaders`

## `getItemsFromRssFeed`

Downloads the latest items from an RSS feed.

```chute
getItemsFromRssFeed(Text, Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRSSFeedURL` | Text | `"https://www.apple.com/newsroom/rss-feed.rss"` |
| `WFRSSItemQuantity` | Number | 10 |

Shortcuts action: `is.workflow.actions.rss`

## `getRssFeedsFromPage`

Extracts any RSS feed URLs from the given web URLs or web page.

```chute
getRssFeedsFromPage(Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURLs` | Text | — |

Shortcuts action: `is.workflow.actions.rss.extract`

## `openUrls`

Opens URLs passed into the action in Safari.

```chute
openUrls(Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.openurl`

## `openXCallbackUrl`

Performs the specified x-callback-url action. The x-success, x-cancel, and x-error parameters will be added automatically.

```chute
openXCallbackUrl(Boolean, Text, Text, Text, Boolean, Text, Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFXCallbackCustomCallbackEnabled` | Boolean | — |
| `WFXCallbackCustomSuccessKey` | Text | `"x-success"` |
| `WFXCallbackCustomCancelKey` | Text | — |
| `WFXCallbackCustomErrorKey` | Text | — |
| `WFXCallbackCustomSuccessURLEnabled` | Boolean | — |
| `WFXCallbackCustomSuccessURL` | Text | `"shortcuts://callback"` |
| `WFXCallbackURL` | Text | — |

Shortcuts action: `is.workflow.actions.openxcallbackurl`

## `runjavascriptonwebpage`

Runs JavaScript on a Safari web page passed in as input

```chute
runjavascriptonwebpage(Text, Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFJavaScript` | Text | `"var result = [];
// Get all links from the page
var elements = document.querySelectorAll("a");
for (let element of elements) {
    result.push({
        "url": element.href,
        "text": element.innerText
    });
}

// Call completion to finish
completion(result);"` |
| `WFInput` | Any | — |

> Safari Web Page items are only available when running your shortcut as an Action Extension in Safari.

Shortcuts action: `is.workflow.actions.runjavascriptonwebpage`

## `searchWeb`

Searches the web for the text provided as input.

```chute
searchWeb(Enum, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchWebDestination` | Amazon \| Bing \| DuckDuckGo \| eBay \| Google \| Reddit \| Twitter \| Yahoo! \| YouTube | `"Google"` |
| `WFInputText` | Text | — |

Shortcuts action: `is.workflow.actions.searchweb`

## `showInItunesStore`

Shows the iTunes products or App Store apps passed as input in a store sheet. This is useful with the Find iTunes Store Items and Find App Store Apps actions.

```chute
showInItunesStore(Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFProduct` | Any | — |

Shortcuts action: `is.workflow.actions.showinstore`

## `showWebView`

Shows the web URL passed into the action in a Safari View Controller, allowing you to view the web page without switching apps.

```chute
showWebView(Boolean, Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEnterSafariReader` | Boolean | false |
| `WFURL` | Text | — |

Shortcuts action: `is.workflow.actions.showwebpage`

## `url`

Passes the specified URL to the next action.

```chute
url(Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURLActionURL` | Text | — |

Shortcuts action: `is.workflow.actions.url`

## `urlEncode`

Encodes or decodes text passed into the action to be suitable for inclusion in a URL by adding or removing percent escapes when appropriate.

```chute
urlEncode(Enum, Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEncodeMode` | Encode \| Decode | `"Encode"` |
| `WFInput` | Text | — |

Shortcuts action: `is.workflow.actions.urlencode`
