# DashAdmin Real Data

## Requirements

### Requirement: Real KPI Values

The system MUST derive `perfilesSilenciosos` and `intervencionesMes` from Supabase queries, not hardcoded constants.

#### Scenario: DB has data

- GIVEN students with scores and interventions exist
- WHEN DashAdmin renders
- THEN KPI cards display counts from `get_distribucion_cohorte` and `count(intervenciones WHERE month = current)`

#### Scenario: DB empty

- GIVEN no scores or interventions exist
- WHEN DashAdmin renders
- THEN KPI cards display `0` with no NaN or errors

### Requirement: Real Bar Chart Data

The system MUST populate the "Materias Críticas" bar chart from real materia-level metrics, replacing the hardcoded `abandonoData` array.

#### Scenario: Materia metrics available

- GIVEN aggregated abandono data exists per materia
- WHEN the bar chart renders
- THEN each bar reflects the real percentage for that materia
