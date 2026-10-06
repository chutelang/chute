# Web

URLs, HTTP requests, web pages, and RSS.

```chute
import Web;
```

## `addToReadingList`

Adds URLs passed into the action to your reading list.

```chute
addToReadingList(url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.readinglist`

## `expandUrl`

This action expands and cleans up URLs which have been shortened using a URL shortening service like TinyURL or Bit.ly.

```chute
expandUrl(url: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

> The expanded URL is cleaned, removing unnecessary parameters such as "utm_source".

Shortcuts action: `is.workflow.actions.url.expand`

## `filterArticles`

```chute
filterArticles(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Article
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Title \\| Author \\| Published Date \\| URL \\| Number of Words \\| Main Image URL \\| Excerpt \\| Body | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.articles`

## `findAppStoreApps`

Searches the App Store, returning the apps that match the specified search terms. You can get more details about the results using the Get Details of App Store App action.

```chute
findAppStoreApps(search: Text, searchBy: Text, results: Text, region: Text, WFItemLimit: Number) -> App
```

| Parameter | Type | Default |
| --- | --- | --- |
| `search` | Text | — |
| `searchBy` | Text | — |
| `results` | Text | — |
| `region` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchappstore`

## `findItunesStoreItems`

Searches the iTunes Store, returning the items that match the specified search terms. You can get more details about the results using the Get Details of iTunes Product action.

```chute
findItunesStoreItems(search: Text, category: Text, searchBy: Text, results: Text, region: Text, WFItemLimit: Number) -> iTunesProduct
```

| Parameter | Type | Default |
| --- | --- | --- |
| `search` | Text | — |
| `category` | Text | — |
| `searchBy` | Text | — |
| `results` | Text | — |
| `region` | Text | — |
| `WFItemLimit` | Number | 25 |

Shortcuts action: `is.workflow.actions.searchitunes`

## `getArticleUsingSafariReader`

Gets article details, including body text, author, publish date, and more, from every URL passed into the action.

```chute
getArticleUsingSafariReader(url: Text) -> Article
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

> Use a Get Details of Article action immediately after this action to get specific details about the article. This action only supports getting one article from each URL.

Shortcuts action: `is.workflow.actions.getarticle`

## `getComponentOfUrl`

Gets the specified part of the URL passed into the action.

```chute
getComponentOfUrl(url: Text, component: Enum) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |
| `component` | Scheme \\| User \\| Password \\| Host \\| Port \\| Path \\| Query \\| Fragment | `"Scheme"` |

> URLs are structured as follows: scheme://user:password@host:port/path?query#fragment

Shortcuts action: `is.workflow.actions.geturlcomponent`

## `getContentsOfUrl`

Gets the contents of URLs passed into the action. Useful for downloading files and web content, or for making API requests.

```chute
getContentsOfUrl(url: Text, method: Enum, ShowHeaders: Any, WFHTTPHeaders: Dictionary, requestBody: Enum, formValues: Dictionary, jsonValues: Dictionary, file: Any) -> File
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |
| `method` | GET \\| POST \\| PUT \\| PATCH \\| DELETE | `"GET"` |
| `ShowHeaders` | Any | — |
| `WFHTTPHeaders` | Dictionary | — |
| `requestBody` | JSON \\| Form \\| File | `"JSON"` |
| `formValues` | Dictionary | — |
| `jsonValues` | Dictionary | — |
| `file` | Any | — |

> To make a multipart HTTP request, choose "Form" as the request body type and add files as field values.

Shortcuts action: `is.workflow.actions.downloadurl`

## `getContentsOfWebPage`

Extracts the contents of the web pages passed into the action.

```chute
getContentsOfWebPage(url: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.getwebpagecontents`

## `getCurrentWebPageFromSafari`

Gets the web page of the frontmost Safari window.

```chute
getCurrentWebPageFromSafari() -> WebPage
```

Shortcuts action: `is.workflow.actions.safari.geturl`

## `getDetailsOfArticle`

```chute
getDetailsOfArticle(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Title \\| Author \\| Published Date \\| URL \\| Number of Words \\| Main Image URL \\| Excerpt \\| Body | — |

Shortcuts action: `is.workflow.actions.properties.articles`

## `getDetailsOfSafariWebPage`

```chute
getDetailsOfSafariWebPage(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Page Contents \\| Page Selection \\| Page URL \\| Name | — |

> Safari Web Page items are only available when running your shortcut as an Action Extension in Safari.

Shortcuts action: `is.workflow.actions.properties.safariwebpage`

## `getHeadersOfUrl`

Retrieves the HTTP headers of the URL passed as input using a HEAD request.

```chute
getHeadersOfUrl(url: Text) -> Dictionary
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.url.getheaders`

## `getItemsFromRssFeed`

Downloads the latest items from an RSS feed.

```chute
getItemsFromRssFeed(url: Text, WFRSSItemQuantity: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | `"https://www.apple.com/newsroom/rss-feed.rss"` |
| `WFRSSItemQuantity` | Number | 10 |

Shortcuts action: `is.workflow.actions.rss`

## `getRssFeedsFromPage`

Extracts any RSS feed URLs from the given web URLs or web page.

```chute
getRssFeedsFromPage(page: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `page` | Text | — |

Shortcuts action: `is.workflow.actions.rss.extract`

## `openUrls`

Opens URLs passed into the action in Safari.

```chute
openUrls(url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.openurl`

## `openXCallbackUrl`

Performs the specified x-callback-url action. The x-success, x-cancel, and x-error parameters will be added automatically.

```chute
openXCallbackUrl(customCallback: Boolean, successKey: Text, cancelKey: Text, errorKey: Text, customXSuccessUrl: Boolean, xSuccessUrl: Text, xCallbackUrl: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `customCallback` | Boolean | — |
| `successKey` | Text | `"x-success"` |
| `cancelKey` | Text | — |
| `errorKey` | Text | — |
| `customXSuccessUrl` | Boolean | — |
| `xSuccessUrl` | Text | `"shortcuts://callback"` |
| `xCallbackUrl` | Text | — |

Shortcuts action: `is.workflow.actions.openxcallbackurl`

## `runjavascriptonwebpage`

Runs JavaScript on a Safari web page passed in as input

```chute
runjavascriptonwebpage(javascript: Text, webPage: WebPage) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `javascript` | Text | `"var result = [];
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
| `webPage` | WebPage | — |

> Safari Web Page items are only available when running your shortcut as an Action Extension in Safari.

Shortcuts action: `is.workflow.actions.runjavascriptonwebpage`

## `searchWeb`

Searches the web for the text provided as input.

```chute
searchWeb(service: Enum, text: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `service` | Amazon \\| Bing \\| DuckDuckGo \\| eBay \\| Google \\| Reddit \\| Twitter \\| Yahoo! \\| YouTube | `"Google"` |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.searchweb`

## `showInItunesStore`

Shows the iTunes products or App Store apps passed as input in a store sheet. This is useful with the Find iTunes Store Items and Find App Store Apps actions.

```chute
showInItunesStore(product: App)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `product` | App | — |

Shortcuts action: `is.workflow.actions.showinstore`

## `showWebView`

Shows the web URL passed into the action in a Safari View Controller, allowing you to view the web page without switching apps.

```chute
showWebView(enterSafariReader: Boolean, url: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `enterSafariReader` | Boolean | false |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.showwebpage`

## `url`

Passes the specified URL to the next action.

```chute
url(url: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `url` | Text | — |

Shortcuts action: `is.workflow.actions.url`

## `urlEncode`

Encodes or decodes text passed into the action to be suitable for inclusion in a URL by adding or removing percent escapes when appropriate.

```chute
urlEncode(mode: Enum, text: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `mode` | Encode \\| Decode | `"Encode"` |
| `text` | Text | — |

Shortcuts action: `is.workflow.actions.urlencode`
