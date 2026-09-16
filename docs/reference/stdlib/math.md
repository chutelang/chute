# Math

Calculations, measurements, and unit conversion.

```chute
import Math;
```

## `calculate`

Performs a number operation on the input and returns the result.

```chute
calculate(Number, Enum, Enum, Number, Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Number | — |
| `WFMathOperation` | + \| - \| × \| ÷ \| … | `"+"` |
| `WFScientificMathOperation` | Modulus \| x^2 \| x^3 \| x^y \| e^x \| 10^x \| ln(x) \| log(x) \| √x \| ∛x \| x! \| sin(x) \| cos(x) \| tan(x) \| abs(x) | — |
| `WFMathOperand` | Number | — |
| `WFScientificMathOperand` | Number | — |

Shortcuts action: `is.workflow.actions.math`

## `calculateExpression`

Evaluates the mathematical expression in the given input text and outputs the result as a number. 

Example expressions:

7 + 7

8 * sqrt(5)

$8 USD in euros

7 feet in meters

```chute
calculateExpression(Text) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `Input` | Text | — |

Shortcuts action: `is.workflow.actions.calculateexpression`

## `calculateStatistics`

Calculates statistics on the numbers that are provided as input.

```chute
calculateStatistics(Enum, Any) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFStatisticsOperation` | Average \| Minimum \| Maximum \| Sum \| Median \| Mode \| Range \| Standard Deviation | `"Average"` |
| `Input` | Any | — |

Shortcuts action: `is.workflow.actions.statistics`

## `convertMeasurement`

Converts the measurements passed into the action to the specified unit.

```chute
convertMeasurement(Text, Text, Any) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMeasurementUnitType` | Text | `"Length"` |
| `WFMeasurementUnit` | Text | — |
| `WFInput` | Any | — |

Shortcuts action: `is.workflow.actions.measurement.convert`

## `measurement`

Passes the specified measurement (including number and unit) to the next action.

```chute
measurement(Text, Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFMeasurementUnitType` | Text | `"Length"` |
| `WFMeasurementUnit` | Number | — |

Shortcuts action: `is.workflow.actions.measurement.create`

## `number`

Passes a number to the next action.

```chute
number(Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFNumberActionNumber` | Number | — |

Shortcuts action: `is.workflow.actions.number`

## `randomNumber`

Passes a random number between the given minimum and maximum to the next action. The minimum and maximum numbers are included as possible results.

```chute
randomNumber(Number, Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFRandomNumberMinimum` | Number | — |
| `WFRandomNumberMaximum` | Number | — |

Shortcuts action: `is.workflow.actions.number.random`

## `roundNumber`

Rounds the number(s) passed into the action.

```chute
roundNumber(Number, Enum, Enum, Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `WFInput` | Number | — |
| `WFRoundTo` | Millions \| Hundred Thousands \| Ten Thousands \| Thousands \| Hundreds Place \| Tens Place \| Ones Place \| Tenths \| Hundredths \| Thousandths \| Ten Thousandths \| Hundred Thousandths \| Millionths \| Ten Millionths \| Hundred Millionths \| Billionths \| 10 ^ | `"Ones Place"` |
| `WFRoundMode` | Normal \| Always Round Up \| Always Round Down | `"Normal"` |
| `TenToThePowerOf` | Number | 0 |

Shortcuts action: `is.workflow.actions.round`
