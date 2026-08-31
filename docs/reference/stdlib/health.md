# Health

Actions for logging and reading Apple Health data.

## logHealthSample

Log a health sample.

```text
logHealthSample(type: Text, value: Number)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `Text` | — | The health quantity type to log. |
| `value` | `Number` | — | The value to record. |

Shortcuts action: `is.workflow.actions.health.logworkout`

## findHealthSamples

Find health samples of a given type.

```text
findHealthSamples(type: Text, count: Number = 7)
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `Text` | — | The health quantity type to query. |
| `count` | `Number` | `7` | The number of samples to retrieve. |

Shortcuts action: `is.workflow.actions.health.quantity.get`
