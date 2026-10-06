# Math

Calculations, measurements, and unit conversion.

```chute
import Math;
```

## `calculate`

Performs a number operation on the input and returns the result.

```chute
calculate(number: Number, operation: Enum, scientificOperation: Enum, WFMathOperand: Number, WFScientificMathOperand: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `number` | Number | — |
| `operation` | + \\| - \\| × \\| ÷ \\| … | `"+"` |
| `scientificOperation` | Modulus \\| x^2 \\| x^3 \\| x^y \\| e^x \\| 10^x \\| ln(x) \\| log(x) \\| √x \\| ∛x \\| x! \\| sin(x) \\| cos(x) \\| tan(x) \\| abs(x) | — |
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
calculateExpression(input: Text) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `input` | Text | — |

Shortcuts action: `is.workflow.actions.calculateexpression`

## `calculateStatistics`

Calculates statistics on the numbers that are provided as input.

```chute
calculateStatistics(operation: Enum, input: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `operation` | Average \\| Minimum \\| Maximum \\| Sum \\| Median \\| Mode \\| Range \\| Standard Deviation | `"Average"` |
| `input` | Number | — |

Shortcuts action: `is.workflow.actions.statistics`

## `convertMeasurement`

Converts the measurements passed into the action to the specified unit.

```chute
convertMeasurement(type: Text, unit: Text, measurement: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Text | `"Length"` |
| `unit` | Text | — |
| `measurement` | Number | — |

Shortcuts action: `is.workflow.actions.measurement.convert`

## `measurement`

Passes the specified measurement (including number and unit) to the next action.

```chute
measurement(type: Text, value: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `type` | Text | `"Length"` |
| `value` | Number | — |

Shortcuts action: `is.workflow.actions.measurement.create`

## `number`

Passes a number to the next action.

```chute
number(number: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `number` | Number | — |

Shortcuts action: `is.workflow.actions.number`

## `randomNumber`

Passes a random number between the given minimum and maximum to the next action. The minimum and maximum numbers are included as possible results.

```chute
randomNumber(minimum: Number, maximum: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `minimum` | Number | — |
| `maximum` | Number | — |

Shortcuts action: `is.workflow.actions.number.random`

## `roundNumber`

Rounds the number(s) passed into the action.

```chute
roundNumber(number: Number, value: Enum, mode: Enum, tenToThePowerOf: Number) -> Number
```

| Parameter | Type | Default |
| --- | --- | --- |
| `number` | Number | — |
| `value` | Millions \\| Hundred Thousands \\| Ten Thousands \\| Thousands \\| Hundreds Place \\| Tens Place \\| Ones Place \\| Tenths \\| Hundredths \\| Thousandths \\| Ten Thousandths \\| Hundred Thousandths \\| Millionths \\| Ten Millionths \\| Hundred Millionths \\| Billionths \\| 10 ^ | `"Ones Place"` |
| `mode` | Normal \\| Always Round Up \\| Always Round Down | `"Normal"` |
| `tenToThePowerOf` | Number | 0 |

Shortcuts action: `is.workflow.actions.round`
