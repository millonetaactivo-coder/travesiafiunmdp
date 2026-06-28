# DashEstudiante Real Data

## Requirements

### Requirement: Real Radial Chart Value

The system MUST set the radial chart `data[0].value` to the student's real score from `ultimoScore.valor`, replacing the hardcoded `75`.

#### Scenario: Student has a score

- GIVEN `ultimoScore.valor = 62`
- WHEN DashEstudiante renders
- THEN the radial bar fills to 62% and the center text shows "62%"

#### Scenario: No score exists

- GIVEN `ultimoScore` is null
- WHEN DashEstudiante renders
- THEN the radial bar shows 0% with a "Sin datos aún" label
