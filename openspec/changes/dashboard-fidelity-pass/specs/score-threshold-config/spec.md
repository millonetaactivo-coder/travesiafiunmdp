# Score Threshold Config

## Requirements

### Requirement: Configurable Thresholds

The system MUST read score thresholds (bajo/medio/alto/crítico boundaries) from the `configuracion` table at runtime, replacing hardcoded constants (30/55/80) in the `calcular-score` edge function.

#### Scenario: Config row exists

- GIVEN `configuracion` has a row with key `score_thresholds` and value `{"bajo": 30, "medio": 55, "alto": 80}`
- WHEN `calcular-score` executes
- THEN it uses those boundary values to classify `nivel_riesgo`

#### Scenario: Config row missing

- GIVEN no `score_thresholds` row in `configuracion`
- WHEN `calcular-score` executes
- THEN it falls back to default values (30/55/80) and logs a warning
