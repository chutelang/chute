# Health

Health data and workouts.

```chute
import Health;
```

## `endWorkout`

Ends the active workout on your Apple Watch.

```chute
endWorkout(app: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | [object Object] |

Shortcuts action: `is.workflow.actions.workout.end`

## `findHealthSamples`

```chute
findHealthSamples()
```

> If you only see some but not all of your data in the results, make sure that “Allow Shortcuts to read data” is set to on in the Health app.

Shortcuts action: `is.workflow.actions.filter.health.quantity`

## `getDetailsOfHealthSample`

```chute
getDetailsOfHealthSample() -> Any
```

Shortcuts action: `is.workflow.actions.properties.health.quantity`

## `logHealthSample`

Adds a data point into the Health app. You can log anything that the Health app supports, including your weight, steps taken, running distance, caloric intake and more.

```chute
logHealthSample(type: Text, WFQuantitySampleQuantity: Number, WFQuantitySampleAdditionalQuantity: Number, reason: Text, WFCategorySampleEnumeration: Text, WFCategorySampleAdditionalEnumerationKey: Text, date: Text, endDate: Text) -> HealthSample
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Text | — |
| `WFQuantitySampleQuantity` | Number | — |
| `WFQuantitySampleAdditionalQuantity` | Number | — |
| `reason` | Text | — |
| `WFCategorySampleEnumeration` | Text | — |
| `WFCategorySampleAdditionalEnumerationKey` | Text | — |
| `date` | Text | — |
| `endDate` | Text | — |

Shortcuts action: `is.workflow.actions.health.quantity.log`

## `logWorkout`

Adds a workout into the Health app. You can log all kinds of activities, from running and cycling to playing a sport.

```chute
logWorkout(type: Text, date: Text, duration: Number, calories: Number, distance: Number) -> HealthSample
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Text | — |
| `date` | Text | — |
| `duration` | Number | — |
| `calories` | Number | — |
| `distance` | Number | — |

Shortcuts action: `is.workflow.actions.health.workout.log`

## `startWorkout`

Starts a workout on your Apple Watch.

```chute
startWorkout(app: Text, type: Text, openGoal: Boolean, value: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `app` | Text | [object Object] |
| `type` | Text | — |
| `openGoal` | Boolean | true |
| `value` | Number | `"15"` |

Shortcuts action: `is.workflow.actions.workout.start`
