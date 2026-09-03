# Math

Calculations, measurements, and unit conversion.

```chute
import Math;
```

## `calculate`

Performs a number operation on the input and returns the result.

```chute
calculate(WFInput: Number, WFMathOperation: Text, WFScientificMathOperation: Text, WFMathOperand: Number, WFScientificMathOperand: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Number` | — |
| `WFMathOperation` | `Text` | `"+"` |
| `WFScientificMathOperation` | `Text` | — |
| `WFMathOperand` | `Number` | — |
| `WFScientificMathOperand` | `Number` | — |

Shortcuts action: `is.workflow.actions.math`

## `calculateExpression`

Evaluates the mathematical expression in the given input text and outputs the result as a number. 

Example expressions:

7 + 7

8 * sqrt(5)

$8 USD in euros

7 feet in meters

```chute
calculateExpression(Input: Text) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Input` | `Text` | — |

Shortcuts action: `is.workflow.actions.calculateexpression`

## `calculateStatistics`

Calculates statistics on the numbers that are provided as input.

```chute
calculateStatistics(WFStatisticsOperation: Text, Input: Any) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFStatisticsOperation` | `Text` | `"Average"` |
| `Input` | `Any` | — |

Shortcuts action: `is.workflow.actions.statistics`

## `convertMeasurement`

Converts the measurements passed into the action to the specified unit.

```chute
convertMeasurement(WFMeasurementUnitType: Text, WFMeasurementUnit: Text, WFInput: Any) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMeasurementUnitType` | `Text` | `"Length"` |
| `WFMeasurementUnit` | `Text` | — |
| `WFInput` | `Any` | — |

Shortcuts action: `is.workflow.actions.measurement.convert`

## `measurement`

Passes the specified measurement (including number and unit) to the next action.

```chute
measurement(WFMeasurementUnitType: Text, WFMeasurementUnit: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMeasurementUnitType` | `Text` | `"Length"` |
| `WFMeasurementUnit` | `Number` | — |

Shortcuts action: `is.workflow.actions.measurement.create`

## `number`

Passes a number to the next action.

```chute
number(WFNumberActionNumber: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNumberActionNumber` | `Number` | — |

Shortcuts action: `is.workflow.actions.number`

## `randomNumber`

Passes a random number between the given minimum and maximum to the next action. The minimum and maximum numbers are included as possible results.

```chute
randomNumber(WFRandomNumberMinimum: Number, WFRandomNumberMaximum: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRandomNumberMinimum` | `Number` | — |
| `WFRandomNumberMaximum` | `Number` | — |

Shortcuts action: `is.workflow.actions.number.random`

## `roundNumber`

Rounds the number(s) passed into the action.

```chute
roundNumber(WFInput: Number, WFRoundTo: Text, WFRoundMode: Text, TenToThePowerOf: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | `Number` | — |
| `WFRoundTo` | `Text` | `"Ones Place"` |
| `WFRoundMode` | `Text` | `"Normal"` |
| `TenToThePowerOf` | `Number` | 0 |

Shortcuts action: `is.workflow.actions.round`
