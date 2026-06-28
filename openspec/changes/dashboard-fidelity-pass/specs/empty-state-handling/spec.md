# Empty State Handling

## Requirements

### Requirement: Graceful Zero-States

Every dashboard and placeholder page MUST display a descriptive empty-state message when the database returns no data. The system MUST NOT render `NaN`, `null`, `undefined`, or throw unhandled errors.

#### Scenario: All dashboards with empty DB

- GIVEN a fresh database with zero students, scores, and interventions
- WHEN any dashboard renders
- THEN each KPI shows `0`, each chart shows an empty-state illustration, and no console errors appear

#### Scenario: Partial data

- GIVEN some students exist but no scores computed yet
- WHEN DashAdmin renders
- THEN `totalEstudiantes` shows real count; risk distribution shows "Sin datos suficientes"
