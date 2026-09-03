# Maps

Location, directions, and weather.

```chute
import Maps;
```

## `filterLocations`

```chute
filterLocations()
```

Shortcuts action: `is.workflow.actions.filter.locations`

## `findPlaces`

Finds nearby places using Maps, and returns the results.

```chute
findPlaces(WFInput: Text, WFSearchQuery: Text, WFSearchRadius: Number, WFSearchSortOrder: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |
| `WFSearchQuery` | `Text` | — |
| `WFSearchRadius` | `Number` | — |
| `WFSearchSortOrder` | `Text` | `"Relevance"` |

Shortcuts action: `is.workflow.actions.searchlocalbusinesses`

## `getCurrentLocation`

Gets the current location of the device.

```chute
getCurrentLocation(Accuracy: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Accuracy` | `Text` | — |

Shortcuts action: `is.workflow.actions.getcurrentlocation`

## `getCurrentWeather`

Gets the current weather conditions at the specified location.

```chute
getCurrentWeather(WFWeatherCustomLocation: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWeatherCustomLocation` | `Text` | — |

Shortcuts action: `is.workflow.actions.weather.currentconditions`

## `getDetailsOfLocations`

```chute
getDetailsOfLocations()
```

Shortcuts action: `is.workflow.actions.properties.locations`

## `getDetailsOfParkedCar`

```chute
getDetailsOfParkedCar()
```

Shortcuts action: `is.workflow.actions.properties.parkedcar`

## `getDetailsOfRideStatus`

```chute
getDetailsOfRideStatus()
```

Shortcuts action: `is.workflow.actions.properties.ridestatus`

## `getDetailsOfWeatherConditions`

```chute
getDetailsOfWeatherConditions()
```

Shortcuts action: `is.workflow.actions.properties.weather.conditions`

## `getDistance`

Calculates the distance to the location passed into this action.

```chute
getDistance(WFGetDirectionsCustomLocation: Text, WFGetDistanceDestination: Text, WFGetDirectionsActionMode: Text, WFDistanceUnit: Text, Accuracy: Text) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetDirectionsCustomLocation` | `Text` | — |
| `WFGetDistanceDestination` | `Text` | — |
| `WFGetDirectionsActionMode` | `Text` | `"Direct"` |
| `WFDistanceUnit` | `Text` | — |
| `Accuracy` | `Text` | — |

Shortcuts action: `is.workflow.actions.getdistance`

## `getHalfwayPoint`

Gets the halfway point between two locations.

```chute
getHalfwayPoint(WFGetHalfwayPointFirstLocation: Text, WFGetHalfwayPointSecondLocation: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetHalfwayPointFirstLocation` | `Text` | — |
| `WFGetHalfwayPointSecondLocation` | `Text` | — |

Shortcuts action: `is.workflow.actions.gethalfwaypoint`

## `getMapsUrl`

Creates a URL to search for the location, place, or text that was passed into the action in a separate maps app.

```chute
getMapsUrl(WFInput: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |

Shortcuts action: `is.workflow.actions.getmapslink`

## `getParkedCarLocation`

Fetches the details of your Parked Car, as stored in the Maps app.

```chute
getParkedCarLocation() -> Any
```

Shortcuts action: `is.workflow.actions.getparkedcarlocation`

## `getTravelTime`

Estimates the amount of time it will take to travel to the location passed into this action.

```chute
getTravelTime(WFGetDirectionsCustomLocation: Text, WFDestination: Text, WFGetDirectionsActionMode: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFGetDirectionsCustomLocation` | `Text` | — |
| `WFDestination` | `Text` | — |
| `WFGetDirectionsActionMode` | `Text` | `"Driving"` |

> Travel times are provided by Apple Maps and take into account current traffic conditions.

Shortcuts action: `is.workflow.actions.gettraveltime`

## `getWeatherForecast`

Gets an hourly or daily weather forecast at the specified location.

```chute
getWeatherForecast(WFWeatherCustomLocation: Text, WFWeatherForecastType: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWeatherCustomLocation` | `Text` | — |
| `WFWeatherForecastType` | `Text` | `"Daily"` |

Shortcuts action: `is.workflow.actions.weather.forecast`

## `location`

Passes the specified location to the next action.

```chute
location(WFLocation: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLocation` | `Text` | — |

Shortcuts action: `is.workflow.actions.location`

## `openDirections`

Opens directions to the location passed into this action in your choice of Maps, Google Maps, Citymapper, Transit, or Waze. For example, you can use this action to get directions to an upcoming event on your calendar.

```chute
openDirections(WFLocation: Text, WFDestination: Text, WFGetDirectionsActionApp: Text, WFGetDirectionsActionMode: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLocation` | `Text` | — |
| `WFDestination` | `Text` | — |
| `WFGetDirectionsActionApp` | `Text` | `"Maps"` |
| `WFGetDirectionsActionMode` | `Text` | `"Driving"` |

Shortcuts action: `is.workflow.actions.getdirections`

## `openInMaps`

Opens your choice of Maps, Google Maps, or Waze and searches for the location, place, or text that was passed into the action.

```chute
openInMaps(WFInput: Text, WFSearchMapsActionApp: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Text` | — |
| `WFSearchMapsActionApp` | `Text` | `"Maps"` |

Shortcuts action: `is.workflow.actions.searchmaps`

## `requestRide`

Requests a ride from the specified pickup location to a specified drop off location.

```chute
requestRide(IntentAppDefinition: Text, PickupLocation: Text, DropOffLocation: Text, RideOption: Text, PaymentMethod: Text, PartySize: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | — |
| `PickupLocation` | `Text` | — |
| `DropOffLocation` | `Text` | — |
| `RideOption` | `Text` | — |
| `PaymentMethod` | `Text` | — |
| `PartySize` | `Number` | 1 |

Shortcuts action: `is.workflow.actions.ride.requestride`

## `setParkedCar`

Saves details of your Parked Car in the Maps app.

```chute
setParkedCar(WFLocation: Text, WFSetParkedCarNotes: Text, WFImage: Any) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFLocation` | `Text` | — |
| `WFSetParkedCarNotes` | `Text` | — |
| `WFImage` | `Any` | — |

Shortcuts action: `is.workflow.actions.setparkedcar`

## `streetAddress`

Passes the specified address to the next action.

```chute
streetAddress(WFAddressLine1: Text, WFAddressLine2: Text, WFCity: Text, WFState: Text, WFPostalCode: Text, WFCountry: Text) -> Text
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFAddressLine1` | `Text` | — |
| `WFAddressLine2` | `Text` | — |
| `WFCity` | `Text` | — |
| `WFState` | `Text` | — |
| `WFPostalCode` | `Text` | — |
| `WFCountry` | `Text` | — |

Shortcuts action: `is.workflow.actions.address`
