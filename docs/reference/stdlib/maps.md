# Maps

Actions for getting the device location, directions, and local business search.

## getCurrentLocation

Get the device's current location.

```text
getCurrentLocation() -> Text
```

Returns the location.

Shortcuts action: `is.workflow.actions.getcurrentlocation`

## getDirections

Open directions to an address.

```text
getDirections(address: Text, mode: Text = "Driving")
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `address` | `Text` | — | The destination address. |
| `mode` | `Text` | `"Driving"` | The travel mode: `"Driving"`, `"Walking"`, or `"Transit"`. |

Shortcuts action: `is.workflow.actions.getdirections`

## searchLocalBusiness

Search for local businesses.

```text
searchLocalBusiness(query: Text)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `query` | `Text` | — | The search query. |

Shortcuts action: `is.workflow.actions.searchlocalbusinesses`
