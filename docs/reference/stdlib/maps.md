# Maps

Location, directions, and weather.

```chute
import Maps;
```

## `findLocations`

```chute
findLocations(sortBy: Enum, order: Enum, WFContentItemLimit: Boolean, WFContentItemLimitNumber: Number) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `sortBy` | Name \\| Street \\| City \\| State \\| ZIP Code \\| Country \\| Phone Number \\| URL \\| Latitude \\| Longitude \\| Altitude | — |
| `order` | Latest First \\| Oldest First | — |
| `WFContentItemLimit` | Boolean | false |
| `WFContentItemLimitNumber` | Number | 5 |

Shortcuts action: `is.workflow.actions.filter.locations`

## `findPlaces`

Finds nearby places using Maps, and returns the results.

```chute
findPlaces(location: Text, search: Text, radius: Number, sortBy: Enum) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |
| `search` | Text | — |
| `radius` | Number | — |
| `sortBy` | Relevance \\| Distance | `"Relevance"` |

Shortcuts action: `is.workflow.actions.searchlocalbusinesses`

## `getCurrentLocation`

Gets the current location of the device.

```chute
getCurrentLocation(precision: Text) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `precision` | Text | — |

Shortcuts action: `is.workflow.actions.getcurrentlocation`

## `getCurrentWeather`

Gets the current weather conditions at the specified location.

```chute
getCurrentWeather(location: Text) -> Weather
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |

Shortcuts action: `is.workflow.actions.weather.currentconditions`

## `getDetailsOfLocations`

```chute
getDetailsOfLocations(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Street \\| City \\| State \\| ZIP Code \\| Country \\| Phone Number \\| URL \\| Latitude \\| Longitude \\| Altitude | — |

Shortcuts action: `is.workflow.actions.properties.locations`

## `getDetailsOfParkedCar`

```chute
getDetailsOfParkedCar(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Name \\| Location \\| Notes \\| Photo | — |

Shortcuts action: `is.workflow.actions.properties.parkedcar`

## `getDetailsOfRideStatus`

```chute
getDetailsOfRideStatus(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Ride Status \\| Pickup Location \\| Drop-off Location \\| Estimated Pickup Date | — |

Shortcuts action: `is.workflow.actions.properties.ridestatus`

## `getDetailsOfWeatherConditions`

```chute
getDetailsOfWeatherConditions(get: Enum) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `get` | Date \\| Condition \\| Temperature \\| High Temperature \\| Low Temperature \\| Feels Like \\| Humidity \\| Visibility \\| Pressure \\| Dew Point \\| UV Index \\| Wind Speed \\| Wind Direction \\| Precipitation Chance \\| Precipitation Amount \\| Sunrise Time \\| Sunset Time \\| Air Quality Index \\| Air Quality Category \\| Location | — |

Shortcuts action: `is.workflow.actions.properties.weather.conditions`

## `getDistance`

Calculates the distance to the location passed into this action.

```chute
getDistance(startLocation: Text, endLocation: Text, routeType: Enum, unit: Text, precision: Text) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `startLocation` | Text | — |
| `endLocation` | Text | — |
| `routeType` | Direct \\| Driving \\| Walking \\| Biking | `"Direct"` |
| `unit` | Text | — |
| `precision` | Text | — |

Shortcuts action: `is.workflow.actions.getdistance`

## `getHalfwayPoint`

Gets the halfway point between two locations.

```chute
getHalfwayPoint(firstLocation: Text, secondLocation: Text) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `firstLocation` | Text | — |
| `secondLocation` | Text | — |

Shortcuts action: `is.workflow.actions.gethalfwaypoint`

## `getMapsUrl`

Creates a URL to search for the location, place, or text that was passed into the action in a separate maps app.

```chute
getMapsUrl(location: Text) -> URL
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |

Shortcuts action: `is.workflow.actions.getmapslink`

## `getParkedCarLocation`

Fetches the details of your Parked Car, as stored in the Maps app.

```chute
getParkedCarLocation() -> ParkedCar
```

Shortcuts action: `is.workflow.actions.getparkedcarlocation`

## `getTravelTime`

Estimates the amount of time it will take to travel to the location passed into this action.

```chute
getTravelTime(startLocation: Text, endLocation: Text, mode: Enum) -> TravelTime
```

| Parameter | Type | Default |
| --- | --- | --- |
| `startLocation` | Text | — |
| `endLocation` | Text | — |
| `mode` | Driving \\| Walking \\| Transit \\| Biking | `"Driving"` |

> Travel times are provided by Apple Maps and take into account current traffic conditions.

Shortcuts action: `is.workflow.actions.gettraveltime`

## `getWeatherForecast`

Gets an hourly or daily weather forecast at the specified location.

```chute
getWeatherForecast(location: Text, type: Enum) -> Weather
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |
| `type` | Hourly \\| Daily | `"Daily"` |

Shortcuts action: `is.workflow.actions.weather.forecast`

## `location`

Passes the specified location to the next action.

```chute
location(location: Text) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |

Shortcuts action: `is.workflow.actions.location`

## `openDirections`

Opens directions to the location passed into this action in your choice of Maps, Google Maps, Citymapper, Transit, or Waze. For example, you can use this action to get directions to an upcoming event on your calendar.

```chute
openDirections(location: Text, destination: Text, app: Text, mode: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |
| `destination` | Text | — |
| `app` | Text | `"Maps"` |
| `mode` | Text | `"Driving"` |

Shortcuts action: `is.workflow.actions.getdirections`

## `openInMaps`

Opens your choice of Maps, Google Maps, or Waze and searches for the location, place, or text that was passed into the action.

```chute
openInMaps(location: Text, app: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |
| `app` | Text | `"Maps"` |

Shortcuts action: `is.workflow.actions.searchmaps`

## `requestRide`

Requests a ride from the specified pickup location to a specified drop off location.

```chute
requestRide(pickupLocation: Text, dropOffLocation: Text, rideType: Text, paymentMethod: Text, partySize: Number) -> RideStatus
```

| Parameter | Type | Default |
| --- | --- | --- |
| `pickupLocation` | Text | — |
| `dropOffLocation` | Text | — |
| `rideType` | Text | — |
| `paymentMethod` | Text | — |
| `partySize` | Number | 1 |

Shortcuts action: `is.workflow.actions.ride.requestride`

## `setParkedCar`

Saves details of your Parked Car in the Maps app.

```chute
setParkedCar(location: Text, notes: Text, image: Image) -> ParkedCar
```

| Parameter | Type | Default |
| --- | --- | --- |
| `location` | Text | — |
| `notes` | Text | — |
| `image` | Image | — |

Shortcuts action: `is.workflow.actions.setparkedcar`

## `streetAddress`

Passes the specified address to the next action.

```chute
streetAddress(line1: Text, line2: Text, city: Text, state: Text, postalCode: Text, region: Text) -> Location
```

| Parameter | Type | Default |
| --- | --- | --- |
| `line1` | Text | — |
| `line2` | Text | — |
| `city` | Text | — |
| `state` | Text | — |
| `postalCode` | Text | — |
| `region` | Text | — |

Shortcuts action: `is.workflow.actions.address`
