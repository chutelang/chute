# Web

URLs, HTTP requests, web pages, and RSS.

```chute
import Web;
```

## `addToReadingList`

Adds URLs passed into the action to your reading list.

```chute
addToReadingList(WFURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.readinglist`

## `expandUrl`

This action expands and cleans up URLs which have been shortened using a URL shortening service like TinyURL or Bit.ly.

```chute
expandUrl(URL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `URL` | `Text` | — |

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
findAppStoreApps(WFSearchTerm: Text, WFAttribute: Text, WFEntity: Text, WFCountry: Text, WFItemLimit: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | `Text` | — |
| `WFAttribute` | `Text` | — |
| `WFEntity` | `Text` | — |
| `WFCountry` | `Text` | — |
| `WFItemLimit` | `Number` | 25 |

Shortcuts action: `is.workflow.actions.searchappstore`

## `findItunesStoreItems`

Searches the iTunes Store, returning the items that match the specified search terms. You can get more details about the results using the Get Details of iTunes Product action.

```chute
findItunesStoreItems(WFSearchTerm: Text, WFMediaType: Text, WFAttribute: Text, WFEntity: Text, WFCountry: Text, WFItemLimit: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchTerm` | `Text` | — |
| `WFMediaType` | `Text` | — |
| `WFAttribute` | `Text` | — |
| `WFEntity` | `Text` | — |
| `WFCountry` | `Text` | — |
| `WFItemLimit` | `Number` | 25 |

Shortcuts action: `is.workflow.actions.searchitunes`

## `getArticleUsingSafariReader`

Gets article details, including body text, author, publish date, and more, from every URL passed into the action.

```chute
getArticleUsingSafariReader(WFWebPage: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWebPage` | `Text` | — |

> Use a Get Details of Article action immediately after this action to get specific details about the article. This action only supports getting one article from each URL.

Shortcuts action: `is.workflow.actions.getarticle`

## `getComponentOfUrl`

Gets the specified part of the URL passed into the action.

```chute
getComponentOfUrl(WFURL: Text, WFURLComponent: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | `Text` | — |
| `WFURLComponent` | `Text` | `"Scheme"` |

> URLs are structured as follows: scheme://user:password@host:port/path?query#fragment

Shortcuts action: `is.workflow.actions.geturlcomponent`

## `getContentsOfUrl`

Gets the contents of URLs passed into the action. Useful for downloading files and web content, or for making API requests.

```chute
getContentsOfUrl(WFURL: Text, WFHTTPMethod: Text, ShowHeaders: Any, WFHTTPHeaders: Dictionary, WFHTTPBodyType: Text, WFFormValues: Dictionary, WFJSONValues: Dictionary, WFRequestVariable: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURL` | `Text` | — |
| `WFHTTPMethod` | `Text` | `"GET"` |
| `ShowHeaders` | `Any` | — |
| `WFHTTPHeaders` | `Dictionary` | — |
| `WFHTTPBodyType` | `Text` | `"JSON"` |
| `WFFormValues` | `Dictionary` | — |
| `WFJSONValues` | `Dictionary` | — |
| `WFRequestVariable` | `Any` | — |

> To make a multipart HTTP request, choose "Form" as the request body type and add files as field values.

Shortcuts action: `is.workflow.actions.downloadurl`

## `getContentsOfWebPage`

Extracts the contents of the web pages passed into the action.

```chute
getContentsOfWebPage(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.getwebpagecontents`

## `getCurrentWebPageFromSafari`

Gets the web page of the frontmost Safari window.

```chute
getCurrentWebPageFromSafari()
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
getHeadersOfUrl(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.url.getheaders`

## `getItemsFromRssFeed`

Downloads the latest items from an RSS feed.

```chute
getItemsFromRssFeed(WFRSSFeedURL: Text, WFRSSItemQuantity: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRSSFeedURL` | `Text` | `"https://www.apple.com/newsroom/rss-feed.rss"` |
| `WFRSSItemQuantity` | `Number` | 10 |

Shortcuts action: `is.workflow.actions.rss`

## `getRssFeedsFromPage`

Extracts any RSS feed URLs from the given web URLs or web page.

```chute
getRssFeedsFromPage(WFURLs: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURLs` | `Text` | — |

Shortcuts action: `is.workflow.actions.rss.extract`

## `openUrls`

Opens URLs passed into the action in Safari.

```chute
openUrls(WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.openurl`

## `openXCallbackUrl`

Performs the specified x-callback-url action. The x-success, x-cancel, and x-error parameters will be added automatically.

```chute
openXCallbackUrl(WFXCallbackCustomCallbackEnabled: Boolean, WFXCallbackCustomSuccessKey: Text, WFXCallbackCustomCancelKey: Text, WFXCallbackCustomErrorKey: Text, WFXCallbackCustomSuccessURLEnabled: Boolean, WFXCallbackCustomSuccessURL: Text, WFXCallbackURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFXCallbackCustomCallbackEnabled` | `Boolean` | — |
| `WFXCallbackCustomSuccessKey` | `Text` | `"x-success"` |
| `WFXCallbackCustomCancelKey` | `Text` | — |
| `WFXCallbackCustomErrorKey` | `Text` | — |
| `WFXCallbackCustomSuccessURLEnabled` | `Boolean` | — |
| `WFXCallbackCustomSuccessURL` | `Text` | `"shortcuts://callback"` |
| `WFXCallbackURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.openxcallbackurl`

## `runjavascriptonwebpage`

Runs JavaScript on a Safari web page passed in as input

```chute
runjavascriptonwebpage(WFJavaScript: Text, WFInput: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFJavaScript` | `Text` | `"var result = [];
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
| `WFInput` | `Any` | — |

> Safari Web Page items are only available when running your shortcut as an Action Extension in Safari.

Shortcuts action: `is.workflow.actions.runjavascriptonwebpage`

## `searchWeb`

Searches the web for the text provided as input.

```chute
searchWeb(WFSearchWebDestination: Text, WFInputText: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFSearchWebDestination` | `Text` | `"Google"` |
| `WFInputText` | `Text` | — |

Shortcuts action: `is.workflow.actions.searchweb`

## `showInItunesStore`

Shows the iTunes products or App Store apps passed as input in a store sheet. This is useful with the Find iTunes Store Items and Find App Store Apps actions.

```chute
showInItunesStore(WFProduct: Any)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFProduct` | `Any` | — |

Shortcuts action: `is.workflow.actions.showinstore`

## `showWebView`

Shows the web URL passed into the action in a Safari View Controller, allowing you to view the web page without switching apps.

```chute
showWebView(WFEnterSafariReader: Boolean, WFURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEnterSafariReader` | `Boolean` | false |
| `WFURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.showwebpage`

## `url`

Passes the specified URL to the next action.

```chute
url(WFURLActionURL: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFURLActionURL` | `Text` | — |

Shortcuts action: `is.workflow.actions.url`

## `urlEncode`

Encodes or decodes text passed into the action to be suitable for inclusion in a URL by adding or removing percent escapes when appropriate.

```chute
urlEncode(WFEncodeMode: Text, WFInput: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFEncodeMode` | `Text` | `"Encode"` |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.urlencode`
