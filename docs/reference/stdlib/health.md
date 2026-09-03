# Health

Health data and workouts.

```chute
import Health;
```

## `endWorkout`

Ends the active workout on your Apple Watch.

```chute
endWorkout(IntentAppDefinition: Text)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |

Shortcuts action: `is.workflow.actions.workout.end`

## `findHealthSamples`

```chute
findHealthSamples()
```

> If you only see some but not all of your data in the results, make sure that “Allow Shortcuts to read data” is set to on in the Health app.

Shortcuts action: `is.workflow.actions.filter.health.quantity`

## `getDetailsOfHealthSample`

```chute
getDetailsOfHealthSample()
```

Shortcuts action: `is.workflow.actions.properties.health.quantity`

## `logHealthSample`

Adds a data point into the Health app. You can log anything that the Health app supports, including your weight, steps taken, running distance, caloric intake and more.

```chute
logHealthSample(WFQuantitySampleType: Text, WFQuantitySampleQuantity: Number, WFQuantitySampleAdditionalQuantity: Number, WFQuantitySampleAdditionalEnumeration: Text, WFCategorySampleEnumeration: Text, WFCategorySampleAdditionalEnumerationKey: Text, WFQuantitySampleDate: Text, WFSampleEndDate: Text) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFQuantitySampleType` | `Text` | — |
| `WFQuantitySampleQuantity` | `Number` | — |
| `WFQuantitySampleAdditionalQuantity` | `Number` | — |
| `WFQuantitySampleAdditionalEnumeration` | `Text` | — |
| `WFCategorySampleEnumeration` | `Text` | — |
| `WFCategorySampleAdditionalEnumerationKey` | `Text` | — |
| `WFQuantitySampleDate` | `Text` | — |
| `WFSampleEndDate` | `Text` | — |

Shortcuts action: `is.workflow.actions.health.quantity.log`

## `logWorkout`

Adds a workout into the Health app. You can log all kinds of activities, from running and cycling to playing a sport.

```chute
logWorkout(WFWorkoutReadableActivityType: Text, WFWorkoutDate: Text, WFWorkoutDuration: Number, WFWorkoutCaloriesQuantity: Number, WFWorkoutDistanceQuantity: Number) -> Any
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFWorkoutReadableActivityType` | `Text` | — |
| `WFWorkoutDate` | `Text` | — |
| `WFWorkoutDuration` | `Number` | — |
| `WFWorkoutCaloriesQuantity` | `Number` | — |
| `WFWorkoutDistanceQuantity` | `Number` | — |

Shortcuts action: `is.workflow.actions.health.workout.log`

## `startWorkout`

Starts a workout on your Apple Watch.

```chute
startWorkout(IntentAppDefinition: Text, workoutName: Text, isOpenEnded: Boolean, WorkoutGoal: Number)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `IntentAppDefinition` | `Text` | [object Object] |
| `workoutName` | `Text` | — |
| `isOpenEnded` | `Boolean` | true |
| `WorkoutGoal` | `Number` | `"15"` |

Shortcuts action: `is.workflow.actions.workout.start`
